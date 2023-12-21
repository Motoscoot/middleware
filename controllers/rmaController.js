const jsforce = require("jsforce");


  conn.login(sfUsername, sfPassword, async (err) => {
    if (err) {
      console.log(err);
      return;
    }

    const queryByCode = `SELECT Id, Status FROM Case`; // WHERE LoyaltyForce__ProductCode__c = '${default_code}'`;

    const resultByCode = await conn.query(queryByCode);

    const CaseData = {
        /*LoyaltyForce__ProductCode__c: isComplete(extra_code),
        Odoo_id__c: isComplete(id),
        magento_code__c: isComplete(magentoId),
        Name: isCompleteProduct(name),
        LoyaltyForce__ProductDescription__c: isComplete(description),
        LoyaltyForce__SKU__c: isComplete(default_code),
        LoyaltyForce__StandardPriceEur__c: isComplete(price),
        LoyaltyForce__CategoryCode1__c: sfCategoryId,*/
      };
  
      let response = {};
    


    /*if (resultByCode.totalSize !== 0) {
      response = await conn
        .sobject("LoyaltyForce__Product__c")
        .upsert(productData, "LoyaltyForce__ProductCode__c");
        response.id = resultByCode.records[0].Id;  // Corrección aquí: cambiar 'resultByEmail' por 'resultByCode'
      } else {
      try {
        response = await conn
          .sobject("LoyaltyForce__Product__c")
          .create(productData);
      } catch (error) {
        response = await handleMalformedIdError(conn, productData, error);
        if (!response) {
          throw error;
        }
      }
    }
    if (!response.success) {
      console.log(response);
      await logErrorToSalesforce(conn, 'INSERT ERROR', JSON.stringify(res), null);
      res.status(201).json({ res: 'Error: Category not found. '});
    } else {
      console.log(`Operación exitosa: ${response.id}`);
      res.status(200).json({ res: response.id });
    }
  });
};*/


const updateRMAOrder = async (req, res) => {
  console.log("Nueva llamada entrante - updateRMA");
  console.log("Body: ", req.body);
  const {
    id,
    state,
    name,
    username: sfUsername,
    password: sfPassword,
    clientID: clientId,
    clientSecret,
    loginUrl,
  } = req.body;
  

  const conn = new jsforce.Connection({
    oauth2: {
      loginUrl,
      clientId,
      clientSecret,
    },
  });

  conn.login(sfUsername, sfPassword, async (err) => {
    if (err) {
      console.log(err);
      return;
    }
    
    let query = `SELECT Id, Status, RecordType.Name FROM Case WHERE Reference__c = '${name}' LIMIT 1`;
    const result = await conn.query(query);
    var newState = '';

    if (result.records && result.records.length > 0) {
      const caso = result.records[0];
      if(state == 'to_approve')
      {
        if(caso.RecordType.Name == 'RMA - Devoluciones')
        {
          newState = 'InProcess';
        }
        else if(caso.RecordType.Name == 'RMA- Garantía')
        {
          newState = 'WaitingForManufacturer';
        }
      }
      else if(state == 'approved')
      {
        if(caso.RecordType.Name == 'RMA - Devoluciones')
        {
          newState = 'Authorized';
        }
        else if(caso.RecordType.Name == 'RMA- Garantía')
        {
          newState = 'Authorized';
        }
      }
      else if(state == 'cancelled')
      {
        if(caso.RecordType.Name == 'RMA - Devoluciones')
        {
          newState = 'Rejected';
        }
        else if(caso.RecordType.Name == 'RMA- Garantía')
        {
          newState = 'Rejected';
        }
      }
      if(newState !== '') {
        const response = await conn.sobject('Case').update({
          Id: caso.Id,
          Status: newState
        });
        
        if(response.success) {
          console.log(`Estado del caso actualizado con éxito: ${response.id}`);
          res.status(200).json({ res: `Caso ${response.id} actualizado con éxito.` });
        } else {
          console.log('Error al actualizar el estado del caso');
          await logErrorToSalesforce(conn, 'UPDATE ERROR', JSON.stringify(response), null);
          res.status(201).json({ res: 'Error: Error al actualizar el estado del caso.' });
        }
      } else {
        console.log('El estado del caso ya está en el valor correcto');
        res.status(200).json({ res: 'Operación omitida: El estado del caso ya está en el valor correcto.' });
      }

    } else {
      console.log('No se encontró el caso especificado');
      await logErrorToSalesforce(conn, 'GET ERROR', JSON.stringify(result), null);
      res.status(201).json({ res: 'Error: No se encontró el caso especificado.' });
    }
  });
};



    const logErrorToSalesforce = async (conn, error, additionalInfo) => {
        const errorData = {
            Name: 'Error in newPurchaseOrder method',
            Error_Message__c: error.message,
            Error_Stack__c: error.stack,
            Additional_Information__c: additionalInfo
        };
    }

    const isComplete = (value) => {
    return value && value !== "false" && value !== "" ? value : "";
    };
  
//module.exports = { newProduct, updateProduct };
})