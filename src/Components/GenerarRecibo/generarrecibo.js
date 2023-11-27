import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF' 
  },
  section: {
    margin: 5,
    padding: 10,
    flexGrow: 1,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#000000',
    color: '#FFFFFF', 
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10,
  },
  subtitle1: {
    fontSize: 13,
    textAlign: 'center',
    paddingLeft:'40%',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  contenti: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'left',
    padding: '5px',
  },
  contentd: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'right',
    padding: '5px',
  },
  firma: {
    marginTop: 8,
    fontSize: 10,
    textAlign: 'center'
  },
  cell: {
    padding: 5,
    border: '1px solid #000000', 
    margin: 2,
  },
  images: {
    height: '30px',
    width: '80px',
  },
  inlineStyle:{
    flexDirection: 'row',
    justifyContent: 'space-between', 
  }
});

const MyDocument = (props) => (
  <Document>
    <Page size="A6" orientation="landscape" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>CONTRARECIBO POR PRESTACIÓN DE SERVICIOS</Text>
        <View style={styles.header}>
          <Image src={require('../../Images/DIF.jpg')} style={styles.images} />
          <Text style={styles.subtitle}>Folio: {props.datos.folio}</Text>
        </View>
        <View style={styles.cell}>
          <View style={styles.inlineStyle}> 
            <View style={[{ flex: 1 }, styles.contenti]}>
              <Text style={styles.subtitle}>{props.datos.unidad}</Text>
            </View>
            <View style={[{ flex: 1 }, styles.contentd]}>
              <Text style={styles.subtitle}>{props.datos.dependencia}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cell}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={[{ flex: 1 }, styles.contenti]}>
                <Text>FECHA:</Text>
                <Text>NOMBRE DEL USUARIO:</Text>
                <Text>CONCEPTO:</Text>
                <Text>IMPORTE TOTAL:</Text>
                <Text>IMPORTE ABONADO:</Text>
                <Text>IMPORTE RESTANTE:</Text>
            </View>
            <View style={[{ flex: 1 }, styles.contentd]}>
                <Text>{props.datos.fecha}</Text>
                <Text>{props.datos.cliente}</Text>
                <Text>{props.datos.conceptos}</Text>
                <Text>$ {props.datos.total}.00</Text>
                <Text>$ {props.datos.abono}.00</Text>
                <Text>$ {props.datos.adeudo}.00</Text>
            </View>
          </View>
        </View>
        <View style={styles.firma}>
          <Text>______________________</Text>
          <Text>Firma de quien recibe    </Text>
        </View>
      </View>
    </Page>
  </Document>
);


export default MyDocument;
