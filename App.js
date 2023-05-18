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

	const onCodeScanned = (type, data) => {
		setType(type);
		setData(data);
		searchProduct(data);
	};

	const addToCart = (item) => {
		const newItem = { ...item };
		newItem.name = name;
		newItem.image = image;
		newItem.quantity = quantity;
		newItem.price = price * quantity;
		newItem.priceUnit = price;
		setModalVisible(false);
		const updatedCartItems = [...cartItems, newItem];
		setCartItems(updatedCartItems);
		sumValues(updatedCartItems);
		cleanInputs();
	};

	const updateCartItemQuantity = (itemId, newQuantity) => {
		const updatedCartItems = cartItems.map((item) => {
			if (item.gtin === itemId) {
				return {
					...item,
					quantity: newQuantity,
					price: item.priceUnit * newQuantity,
				};
			}
			return item;
		});
		setCartItems(updatedCartItems);
		sumValues(updatedCartItems);
	};
	
	const increaseQuantity = (itemId) => {
		const item = cartItems.find((item) => item.gtin === itemId);
		if (item) {
			const newQuantity = parseInt(item.quantity) + 1;
			updateCartItemQuantity(itemId, newQuantity);
		}
	};

	const decreaseQuantity = (itemId) => {
		const item = cartItems.find((item) => item.gtin === itemId);
		if (item && item.quantity > 1) {
			const newQuantity = parseInt(item.quantity) - 1;
			updateCartItemQuantity(itemId, newQuantity);
		}
	};

	const searchProduct = async (barcode) => {
		try {
			const response = await fetch(
				`https://api.cosmos.bluesoft.com.br/gtins/${barcode}`,
				{
					headers: {
						'X-Cosmos-Token': 'cE6aw9VrBvtajy-X_R1vSg'
					}
				}
			);
			const result = await response.json();
			setName(result.description);
			setImage(result.thumbnail);
			setProduct(result);
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

	const sumValues = (items) => {
		let sum = 0;
		items.forEach((item) => {
		  sum += item.price;
		});
		setTotal(sum);
	  };
	  

	const formatTotal = (value) => {
		return parseFloat(value * 0.01).toFixed(2);
	};

	return (
		<SafeAreaView style={styles.container}>
			<Modal
				visible={modalVisible}
				transparent={true}
				animationType="slide"
			// onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modal}>
					<Scanner onCodeScanned={onCodeScanned} />

					<View style={styles.containerForm}>
						<View style={styles.w50}>
							<Text style={styles.label}>Quantidade</Text>
							<TextInput
								style={styles.input}
								onChangeText={setQuantity}
								value={quantity}
								keyboardType="numeric"
							/>
						</View>

						<View style={styles.w50}>
							<Text style={styles.label}>Valor </Text>
							<TextInput
								style={styles.input}
								onChangeText={setPrice}
								value={price}
								keyboardType="numeric"
							/>
						</View>
					</View>

					<View style={styles.containerBoxProduct}>
						<View style={styles.cartItemContainer}>
							<View style={styles.quadradoA}>
								<Image style={styles.imageProduct} source={{ uri: image ? image : 'https://liftlearning.com/wp-content/uploads/2020/09/default-image-300x169.png' }} />
							</View>
							<View style={styles.quadradoB}>
								<Text>{data}</Text>
								<Text>{name}</Text>
							</View>
							<View style={styles.quadradoC}>
								<TouchableOpacity style={styles.addToCart} onPress={() => addToCart(product)}>
									<Icon style={styles.icon} name="add-outline" size={35} color="#FFFFFF" />
								</TouchableOpacity>
							</View>
						</View>
					</View>

					<View style={styles.close}>
						<Button title="Cancelar" onPress={() => setModalVisible(false)} />
					</View>
				</View>
			</Modal>

			<StatusBar style="auto" />

			<TouchableOpacity style={styles.scanner} onPress={() => setModalVisible(true)}>
				<Icon style={styles.icon} name="scan-outline" size={50} color="white" />
			</TouchableOpacity>

			<FlatList
				data={cartItems}
				ListHeaderComponent={<View style={styles.header}><Text style={styles.headerContent}>Seu carrinho</Text></View>}
				ListFooterComponent={
					<View>
						<View style={styles.footer}>
							<Text style={styles.footerContent}>
								Total:
							</Text>
							<Text style={styles.footerTotal}>
								R$ {formatTotal(total)}
							</Text>
						</View>
						<TouchableOpacity style={styles.buttonSend} onPress={() => increaseQuantity(item.gtin)}>
							<Text>Finalizar pedido</Text>
							<Icon name="checkmark-outline" size={20} />
						</TouchableOpacity>
					</View>
				}
				ListEmptyComponent={<View style={styles.empty}><Text>Não há nada aqui :/</Text></View>}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
				renderItem={({ item }) => (
					<View style={styles.cartItemContainer}>
						<View style={styles.quadradoA}>
							<Image style={styles.imageProduct} source={{ uri: item.thumbnail ? item.thumbnail : 'https://liftlearning.com/wp-content/uploads/2020/09/default-image-300x169.png' }} />
						</View>
						<View style={styles.quadradoB}>
							<Text style={styles.markProduct}>{item.brand.name}</Text>
							<Text style={styles.nameProduct}>{item.name}</Text>
							<Text style={styles.priceProduct}>R$ {formatTotal(item.price)}</Text>
						</View>
						<View style={styles.quadradoC}>
							<View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', justifyContent: 'center', width: '90%', paddingVertical: 5, borderRadius: 5 }}>
								<TouchableOpacity onPress={() => decreaseQuantity(item.gtin)}>
									<Icon style={styles.icon} name="remove-outline" size={20} color="#F08F5F" />
								</TouchableOpacity>
								<Text style={{ fontSize: 18, paddingHorizontal: 10 }}>{item.quantity}</Text>
								<TouchableOpacity onPress={() => increaseQuantity(item.gtin)}>
									<Icon style={styles.icon} name="add-outline" size={20} color="#F08F5F" />
								</TouchableOpacity>
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
		backgroundColor: '#FFFFFF',
	},
	tinyLogo: {
		width: 100,
		height: 100
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
		borderRadius: 11,
		backgroundColor: '#E8E8E8'
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
	header: {
		marginTop: 20,
		height: 40,
	},
	headerContent: {
		color: '#363636',
		fontSize: 26,
		fontWeight: 'bold'
	},
	footer: {
		height: 20,
		justifyContent: 'space-between',
		flexDirection: "row",
		flexWrap: 'wrap',
		marginTop: 20
	},
	footerContent: {
		color: '#363636',
		fontSize: 22,
		fontWeight: 'bold'
	},
	footerTotal: {
		color: '#F08F5F',
		fontSize: 22,
		fontWeight: 'bold'
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
		justifyContent: 'center',
		alignItems: 'center'
	},
	separator: {
		marginVertical: 10,
		backgroundColor: 'gray',
	},
	addToCart: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		width: 45,
		height: 45,
		backgroundColor: '#5A6CF3',
		borderRadius: 11
	},
	containerBoxProduct: {
		paddingHorizontal: 10,
		alignItems: 'center',
		padding: 10,
	},
	close: {
		margin: 10,
	},
	containerForm: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		margin: 10,
		justifyContent: 'space-between'
	},
	w50: {
		width: '48%',
	},
	input: {
		height: 44,
		borderRadius: 4,
		backgroundColor: '#F8F8FB',
		fontSize: 16,
		padding: 10
	},
	label: {
		color: '#363636',
		fontSize: 18,
		marginBottom: 5
	},
	buttonSend: {
		width: '100%',
		backgroundColor: '#90ee90',
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		borderRadius: 6,
		marginTop: 20
	}
});
