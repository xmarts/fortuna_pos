# -*- coding: utf-8 -*-
{
    'name': "Pos custom Fortuna",

    'summary': """
      Template POS Fortuna""",

    'description': """
   Template POS Fortuna
    """,

    'author': "Nayeli Valencia Díaz",
    'website': "http://www.xmarts.com",

 
    'category': 'pos',
    'version': '0.1',

    'depends': ["point_of_sale"],
    'data': [
        # 'security/ir.model.access.csv',
        #'views/views.xml',
        'views/template.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    #"js": ['static/src/js/pos_button.js'], 
    'qweb': ['static/src/xml/*.xml'],
    'application':True,
}