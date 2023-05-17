import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Button, View, Modal, Text, Image, FlatList, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

import Scanner from "./src/components/Scanner";

export default function App() {
	const [modalVisible, setModalVisible] = useState(false);
	const [type, setType] = useState("");
	const [data, setData] = useState("");
	const [name, setName] = useState("");
	const [image, setImage] = useState("");
	const [product, setProduct] = useState("");
	const [cartItems, setCartItems] = useState([]);
	const [quantity, setQuantity] = useState(0);
	const [price, setPrice] = useState(0);
	const [total, setTotal] = useState(0);
	const [values, setValue] = useState([]);

	const onCodeScanned = (type, data) => {
		setType(type);
		setData(data);
		setModalVisible(false);
		searchProduct(data);
	};

	const addToCart = (item) => {
		const newItem = { ...item };
		newItem.quantidade = quantity;
		newItem.preco = price * quantity;
		console.log(newItem)
		setCartItems([...cartItems, newItem]);
		sumValues()
		cleanInputs()
	};

	const searchProduct = async (barcode) => {
		try {
			const response = await fetch(
				`http://brasilapi.simplescontrole.com.br/mercadoria/consulta/?ean=${barcode}&access-token=1qBM1JcjblppLP7wJFcEh5HQiWyXCg8Q`
			);
			const result = await response.json();
			setName(result.return.nome);
			setImage(result.return.imagem_produto);
			setProduct(result.return);
		} catch (error) {
			console.error(error);
		}
	};

	const cleanInputs = () => {
		setData('')
		setName('')
		setImage('')
		setProduct('')
		setQuantity(0)
		setPrice(0)
	}

	const sumValues = () => {
		currentValue = price * quantity;
		setValue([...values, currentValue]);

		const sum = values.reduce((accumulator, currentValue) => {
			return accumulator + currentValue;
		}, 0);

		setTotal(sum + currentValue);
	};

	const formatTotal = (value) => {
		return value.toFixed(2);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Modal
				visible={modalVisible}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modal}>
					<Scanner onCodeScanned={onCodeScanned} />
					<Button title="Cancelar" onPress={() => setModalVisible(false)} />
				</View>
			</Modal>

			<StatusBar style="auto" />

			<TouchableOpacity style={styles.scanner} onPress={() => setModalVisible(true)}>
				<Icon style={styles.icon} name="scan-outline" size={50} color="white" />
			</TouchableOpacity>

			<Text>Data: {data}</Text>
			<Image style={styles.tinyLogo} source={{ uri: image ? image : 'https://liftlearning.com/wp-content/uploads/2020/09/default-image-300x169.png' }} />
			<Text>Nome: {name}</Text>

			<Text style={styles.label}>Quantidade:</Text>
			<TextInput
				style={styles.input}
				onChangeText={setQuantity}
				value={quantity}
				keyboardType="numeric"
			/>

			<Text style={styles.label}>Valor:</Text>
			<TextInput
				style={styles.input}
				onChangeText={setPrice}
				value={price}
				keyboardType="numeric"
			/>

			<Button title="Adicionar ao carrinho" onPress={() => addToCart(product)} />

			<FlatList
				data={cartItems}
				ListHeaderComponent={<View style={styles.header}><Text>Seu carrinho</Text></View>}
				ListFooterComponent={<View style={styles.footer}><Text style={{ justifyContent: 'space-between' }}>Total: R$ {formatTotal(total)}</Text></View>}
				ListEmptyComponent={<View style={styles.empty}><Text>Não há nada aqui :/</Text></View>}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
				renderItem={({ item }) => (
					<View style={styles.cartItemContainer}>
						<View style={styles.quadradoA}>
							<Image style={styles.imageProduct} source={{ uri: item.imagem_produto ? item.imagem_produto : 'https://liftlearning.com/wp-content/uploads/2020/09/default-image-300x169.png'}} />
						</View>
						<View style={styles.quadradoB}>
							<Text style={styles.markProduct}>{item.marca_nome}</Text>
							<Text style={styles.nameProduct}>{item.nome.substring(0, 20)}</Text>
							<Text style={styles.priceProduct}>R$ {formatTotal(item.preco)}</Text>
						</View>
						<View style={styles.quadradoC}>
							<View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', justifyContent: 'center', width: '90%', paddingVertical: 5, borderRadius: 5 }}>
								<Icon style={styles.icon} name="remove-outline" size={20} color="#F08F5F" />
								<Text style={{ fontSize: 18, paddingHorizontal: 10}}>{item.quantidade}</Text>
								<Icon style={styles.icon} name="add-outline" size={20} color="#F08F5F" />
							</View>
						</View>
					</View>
				)}
				keyExtractor={(item, index) => index.toString()}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 60,
		paddingHorizontal: 16
	},
	modal: {
		flex: 1,
		alignItems: "center",
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	tinyLogo: {
		width: 150,
		height: 150
	},
	scanner: {
		position: 'absolute',
		bottom: 20,
		width: 80,
		height: 80,
		paddingLeft: 3,
		margin: 0,
		backgroundColor: '#F08F5F',
		alignItems: 'center',
		borderRadius: 50,
		justifyContent: 'center',
		zIndex: 1
	},
	cartItemContainer: {
		backgroundColor: '#F8F8FB',
		padding: 10,
		height: 85,
		borderRadius: 16,
		justifyContent: "space-between",
		flexDirection: "row",
		flexWrap: 'wrap'
	},
	imageProduct: {
		height: 60,
		width: 60,
		borderRadius: 11
	},
	markProduct: {
		color: '#B1B1B1',
		fontSize: 11
	},
	nameProduct: {
		fontSize: 12,
		color: '#494949',
		paddingVertical: 4
	},
	priceProduct: {
		color: '#F08F5F',
		fontSize: 16,
		fontWeight: 'bold'
	},
	// item: {
	// 	flex: 1,
	// 	justifyContent: 'center',
	// 	alignItems: 'center',
	// 	height: 100,
	// 	borderWidth: 1,
	// 	borderColor: 'gray',
	// },
	header: {
		height: 20,
	},
	footer: {
		height: 20,
	},
	empty: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	quadradoA: {
		height: '100%',
		width: '20%',
		justifyContent: 'center'
	},
	quadradoB: {
		height: '100%',
		width: '50%',
		justifyContent: 'center',
		paddingHorizontal: 10
	},
	quadradoC: {
		height: '100%',
		width: '30%',
		bottom: 0,
		justifyContent: 'flex-end'
	},
	separator: {
		marginVertical: 5,
		backgroundColor: 'gray',
	},
});
