import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
	StyleSheet,
	Button,
	View,
	Modal,
	Text,
	Image,
	FlatList,
	TextInput,
	TouchableOpacity,
	SafeAreaView,
	Linking
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import Scanner from "./src/components/Scanner";
import { Swipeable } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
	const [formattedPrice, setFormattedPrice] = useState('');
	const [scannerUsed, setScannerUsed] = useState(false);

	const onCodeScanned = (type, data) => {
		setScannerUsed(true)
		setType(type);
		setData(data);
		searchProduct(data);
	};

	const addToCart = (item) => {
		const newItem = { ...item };
		newItem.name = name ?? null;
		newItem.image = image ?? null;
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
			console.log(result)
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
		setFormattedPrice(0)
		setScannerUsed(false)
	}

	const sumValues = (items) => {
		let sum = 0;
		items.forEach((item) => {
		  sum += item.price;
		});
		setTotal(sum);
	};

	const removeItem = (itemId) => {
		const updatedCartItems = cartItems.filter(
			(item) => item.gtin !== itemId
		);
		setCartItems(updatedCartItems);
		sumValues(updatedCartItems);
	};

	const formatPrice = (value) => {
		return parseFloat(value * 0.01).toFixed(2);
	};

	const handlePriceChange = (value) => {
		// Remove todos os caracteres que não são dígitos
		const numericValue = value.replace(/[^0-9]/g, '');
		
		// Converte o valor para um número e armazena no estado
		setPrice(numericValue)
		setFormattedPrice(parseFloat(numericValue) / 100);
	};

	const formattedPriceInput = formattedPrice.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	const sendWhatsAppMessage = () => {
		const phoneNumber = "5585991887855";
		let message = "Itens do carrinho:\n\n";
	  
		// Percorre os itens do carrinho e adiciona as informações à mensagem
		cartItems.forEach((item, index) => {
		  const { name, quantity, price } = item;
		  const formattedPrice = formatPrice(price);
		  message += `${name} - Quantidade: ${quantity} - Preço: R$ ${formattedPrice}\n\n`;
		});
	  
		message += `*Total: R$ ${formatPrice(total)}*`;
		// Codifica a mensagem para ser incluída na URL
		const encodedMessage = encodeURIComponent(message);
	  
		// Constrói a URL com o número de telefone e a mensagem
		const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
	  
		// Abre a URL no navegador padrão do dispositivo
		Linking.openURL(url)
		  .catch((error) => {
			console.error("Erro ao abrir o WhatsApp: ", error);
		  });
	  };
	  

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={styles.container}>
				<Modal
					visible={modalVisible}
					transparent={true}
					animationType="slide"
				>
					<View style={styles.modal}>

					<Scanner onCodeScanned={onCodeScanned} />

					{scannerUsed ? (
					<>
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
									onChangeText={handlePriceChange}
									value={formattedPriceInput}
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
					</>
					) : (
						<View>
							{/* Conteúdo para exibir quando o scanner não for utilizado */}
						</View>
					)}

						<View style={styles.close}>
							<TouchableOpacity style={styles.btnClose} onPress={() => setModalVisible(false)}>
								<Icon name="close" size={35} color="white" />
							</TouchableOpacity>
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
									R$ {formatPrice(total)}
								</Text>
							</View>
							<TouchableOpacity style={styles.buttonSend} onPress={sendWhatsAppMessage}>
								<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Finalizar pedido</Text>
								<Icon style={{ color: 'white' }} name="checkmark-outline" size={24} />
							</TouchableOpacity>
						</View>
					}
					ListEmptyComponent={<View style={styles.empty}><Text>Não há nada aqui :/</Text></View>}
					ItemSeparatorComponent={() => <View style={styles.separator} />}
					renderItem={({ item }) => (
						<Swipeable
							renderRightActions={() => (
								<TouchableOpacity style={styles.deleteButton} onPress={() => removeItem(item.gtin)}>
								<Icon name="trash-outline" size={20} color="white" />
								</TouchableOpacity>
							)}
						>
							<View style={styles.cartItemContainer}>
								<View style={styles.quadradoA}>
									<Image style={styles.imageProduct} source={{ uri: item.thumbnail ? item.thumbnail : 'https://liftlearning.com/wp-content/uploads/2020/09/default-image-300x169.png' }} />
								</View>
								<View style={styles.quadradoB}>
									<Text style={styles.markProduct}>{item.brand ? item.brand.name : 'Desconhecido'}</Text>
									<Text style={styles.nameProduct}>{item.name}</Text>
									<Text style={styles.priceProduct}>R$ {formatPrice(item.price)}</Text>
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
						</Swipeable>
					)}
					keyExtractor={(item, index) => index.toString()}
				/>
			</SafeAreaView>
		</GestureHandlerRootView>
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
		position: 'absolute',
		top: 10,
		right: 10
	},
	btnClose: {
		backgroundColor: '#F08F5F',
		borderRadius: 50,
		padding: 5
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
		backgroundColor: '#F08F5F',
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		borderRadius: 6,
		marginTop: 20
	},
	deleteButton: {
		backgroundColor: '#F08F5F',
		justifyContent: 'center',
		alignItems: 'center',
		width: 75,
		borderRadius: 6
	},
});
