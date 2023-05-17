import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

export default function Scanner(props) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    props.onCodeScanned(type, data);

    try {
      const response = await fetch(
        `http://brasilapi.simplescontrole.com.br/mercadoria/consulta/?ean=${data}&access-token=1qBM1JcjblppLP7wJFcEh5HQiWyXCg8Q`
      );
      const result = await response.json();
      setProductData(result.return);
    } catch (error) {
      console.error(error);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View
      style={{
        width: "100%",
        height: "90%",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {scanned && (
        <View>
          <Button title={"Repetir Escaneamento"} onPress={() => setScanned(false)} />
          {productData && (
            <View>
              <Text>Produto: {productData.nome}</Text>
              <Text>Descrição: {productData.descricao}</Text>
              <Text>Preço: {productData.preco}</Text>
              {/* ...exiba outros dados do produto conforme necessário */}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
