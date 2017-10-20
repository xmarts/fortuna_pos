odoo.define('fortuna_pos.pos', function (require) {
    "use strict";

	var pos_model = require('point_of_sale.models');
    var Model = require('web.DataModel');
    var screens = require('point_of_sale.screens');
    var core = require('web.core');
	var QWeb = core.qweb;
	var _t = core._t;

	console.log("HOLAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", pos_model)
	screens.ReceiptScreenWidget.include({
		renderElement: function() {
	        var self = this;
	        this._super();
	        //alert(NumeroALetras(19809.9)) ;

	        this.$('.button.pagare').click(function(){
	        //alert("entro a mi buton")
            if (!self._locked) {
            	//alert("hola")
                self.render_pagare();
            }
        	});
        	this.$('.button.receipt').click(function(){
	        //alert("entro a mi buton")
            if (!self._locked) {
            	//alert("hola")
                self.render_receipt();
            }
        	});
        	this.$('.button.printpay').click(function(){
	        //alert("entro a mi buton")
            if (!self._locked) {
            	//alert("hola")
                self.printpagare();
            }
        	});

   		},

    	render_pagare: function() {
	        var order = this.pos.get_order();
	        this.$('.pos-receipt-container').html(QWeb.render('PosTicket2',{
	                widget:this,
	                order: order,
	                receipt: order.export_for_printing(),
	                orderlines: order.get_orderlines(),
	                paymentlines: order.get_paymentlines(),
         	}));
    	},
    	
        printpagare: function() {
            var self = this;

            if (!this.pos.config.iface_print_via_proxy) { 

                this.lock_screen(true);

                setTimeout(function(){
                    self.lock_screen(false);
                }, 1000);

                this.print_web();
            } else {    // proxy (xml) printing
                this.print_xmlpay();
                this.lock_screen(false);
            }
        },
        print_xmlpay: function() {
            var envia = {
                widget:  this,
                receipt: this.pos.get_order().export_for_printing(),
                amounttext:NumeroALetras(this.pos.get_order().get_total_with_tax()),
                paymentlines: this.pos.get_order().get_paymentlines()
            };
            var receipt = QWeb.render('XmlReceiptpagare',envia);

            this.pos.proxy.print_receipt(receipt);
            this.pos.get_order()._printed = true;
        }

	});
	pos_model.Order = pos_model.Order.extend({
		
		get_amount_to_text: function() {
        return NumeroALetras(this.get_total_with_tax());
    	}

    });

	////////amount_to_text
	function Unidades(num){

    switch(num)
    {
        case 1: return "UNO";
        case 2: return "DOS";
        case 3: return "TRES";
        case 4: return "CUATRO";
        case 5: return "CINCO";
        case 6: return "SEIS";
        case 7: return "SIETE";
        case 8: return "OCHO";
        case 9: return "NUEVE";
    }

    return "";
}//Unidades()

function Decenas(num){

    var decena = Math.floor(num/10);
    var unidad = num - (decena * 10);

    switch(decena)
    {
        case 1:
            switch(unidad)
            {
                case 0: return "DIEZ";
                case 1: return "ONCE";
                case 2: return "DOCE";
                case 3: return "TRECE";
                case 4: return "CATORCE";
                case 5: return "QUINCE";
                default: return "DIECI" + Unidades(unidad);
            }
            break;
        case 2:
            switch(unidad)
            {
                case 0: return "VEINTE";
                default: return "VEINTI" + Unidades(unidad);
            }
            break;
        case 3: return DecenasY("TREINTA", unidad);
        case 4: return DecenasY("CUARENTA", unidad);
        case 5: return DecenasY("CINCUENTA", unidad);
        case 6: return DecenasY("SESENTA", unidad);
        case 7: return DecenasY("SETENTA", unidad);
        case 8: return DecenasY("OCHENTA", unidad);
        case 9: return DecenasY("NOVENTA", unidad);
        case 0: return Unidades(unidad);
    }
}//Unidades()

function DecenasY(strSin, numUnidades) {
    if (numUnidades > 0)
    return strSin + " Y " + Unidades(numUnidades)

    return strSin;
}//DecenasY()

function Centenas(num) {
    var centenas = Math.floor(num / 100);
    var decenas = num - (centenas * 100);

    switch(centenas)
    {
        case 1:
            if (decenas > 0)
                return "CIENTO " + Decenas(decenas);
            return "CIEN";
        case 2: return "DOSCIENTOS " + Decenas(decenas);
        case 3: return "TRESCIENTOS " + Decenas(decenas);
        case 4: return "CUATROCIENTOS " + Decenas(decenas);
        case 5: return "QUINIENTOS " + Decenas(decenas);
        case 6: return "SEISCIENTOS " + Decenas(decenas);
        case 7: return "SETECIENTOS " + Decenas(decenas);
        case 8: return "OCHOCIENTOS " + Decenas(decenas);
        case 9: return "NOVECIENTOS " + Decenas(decenas);
    }

    return Decenas(decenas);
}//Centenas()

function Seccion(num, divisor, strSingular, strPlural) {
     var cientos = Math.floor(num / divisor);
    var resto = num - (cientos * divisor);

    var letras = "";

    if (cientos > 0)
        if (cientos > 1)
            letras = Centenas(cientos) + " " + strPlural;
        else
            letras = strSingular;

    if (resto > 0)
        letras += "";

    return letras;
}//Seccion()

function Miles(num) {

    var divisor = 1000;

    var cientos = Math.floor(num / divisor);

    var resto = num - (cientos * divisor);

    var strMiles = Seccion(num, divisor, "UN MIL", "MIL");
    var strCentenas = Centenas(resto);

    if(strMiles == "")
        return strCentenas;

    return strMiles + " " + strCentenas;
}//Miles()

function Millones(num) {
	var divisor = 1000000;

    var cientos = Math.floor(num / divisor);

    var resto = num - (cientos * divisor);

    var strMillones = Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
    var strMiles = Miles(resto);

    if(strMillones == "")
        return strMiles;

    return strMillones + " " + strMiles;
}//Millones()

function NumeroALetras(num) {
    var data = {
        numero: num,
        enteros: Math.floor(num),
        centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
        letrasCentavos: "",
        letrasMonedaPlural: 'PESOS',//“PESOS”, 'Dólares', 'Bolívares', 'etcs'
        letrasMonedaSingular: 'PESO', //“PESO”, 'Dólar', 'Bolivar', 'etc'

        letrasMonedaCentavoPlural: "CENTAVOS",
        letrasMonedaCentavoSingular: "/100 M.N."
    };

    if (data.centavos > 0) {
        data.letrasCentavos = "CON " + data.centavos + " " + data.letrasMonedaCentavoSingular;
        //  Millones(data.centavos) 
    };

    if(data.enteros == 0)
        return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
    if (data.enteros == 1)
        return Millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;
    else
        return Millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;
}//NumeroALetras()

});