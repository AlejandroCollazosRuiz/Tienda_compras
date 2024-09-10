import express, { Router, query, request } from 'express';
import sql from 'mssql';
import { config } from './config.js';
import { createTokenAccess } from './libs/jwt.js';
import bcrytp from 'bcryptjs'


//Funcion para obtener todos los productos de la base de datos y mostrarlos en el fron-end

const GetProducts = express.Router();

GetProducts.get('/',  async (req, res) =>{

  try {
      const pool = await sql.connect(config);
      const result = await pool.request().query("SELECT idProducto, nombreProducto, descripcionProducto, precioProducto, fotoProducto FROM productos");
      
      res.json(result.recordset);
  } catch (error) {
      res.status(500);
      res.send(error.message);
  }
  

});

const ObtenerProduct = express.Router();

ObtenerProduct.get('/:idProducto',  async (req, res) =>{

  const {idProducto} = req.params;
  try {
      const pool = await sql.connect(config);
      const result = await pool.request()
      .input('idProducto', sql.Int, idProducto)
      .query('SELECT *FROM productos WHERE idProducto=@idProducto');
      console.log(result.recordset)
      res.json(result.recordset);
  } catch (error) {
      res.status(500);
      res.send(error.message);
  }
  

});

const DeletePublicProduct = express.Router();

DeletePublicProduct.get('/:idProducto',  async (req, res) =>{

  const {idProducto} = req.params;
  try {
      const pool = await sql.connect(config);
      const result = await pool.request()
      .input('idProducto', sql.Int, idProducto)
      .query("DELETE *from productoPublicado WHERE idProducto=@idProducto");
      console.log(res.recordset)
      res.json(result.recordset);
  } catch (error) {
      res.status(500);
      res.send(error.message);
  }
  

});

const ActualizarProducto = express.Router();

ActualizarProducto.put('/:idProducto', async (req, res) =>{
  const {nombreProducto, descripcionProducto, stock, idUsuario, cantComentarios, cantlikes, instruccionesReceta, precioProducto} = req.body;
  const {idProducto} = req.params;

  if(nombreProducto===null || descripcionProducto===null || stock===null || idUsuario===null || cantComentarios===null || cantlikes===null || instruccionesReceta===null || precioProducto===null ){
      return res.status(400).json({message: 'Bad request: Please fill all fields.'})
  };

  const pool = await sql.connect(config);
  
  const result = await pool.request()
  .input('nombreProducto', sql.VarChar, nombreProducto)
  .input('descripcionProducto', sql.VarChar, descripcionProducto)
  .input('stock', sql.Int, stock)
  .input('idUsuario', sql.Int, idUsuario)
  .input('cantComentarios', sql.Int, cantComentarios)
  .input('cantlikes', sql.Int, cantlikes)
  .input('instruccionesReceta', sql.VarChar, instruccionesReceta)
  .input('precioProducto', sql.Int, precioProducto)
  .input('idProducto', sql.Int, idProducto)
  .query('UPDATE productos SET nombreProducto=@nombreProducto, descripcionProducto=@descripcionProducto, stock=@stock, idUsuario=@idUsuario, cantComentarios=@cantComentarios, cantlikes=@cantlikes, instruccionesReceta=@instruccionesReceta, precioProducto=@precioProducto WHERE idProducto=@idProducto')
  console.log(result.output, 'Updated Product')
  res.json('Updated Product');
}
)


const ObtenerPublicProduct = express.Router();

ObtenerPublicProduct.get('/:idProducto',  async (req, res) =>{

  const {idProducto} = req.params;
  try {
      const pool = await sql.connect(config);
      const result = await pool.request()
      .input('idProducto', sql.Int, idProducto)
      .query("SELECT *from productoPublicado WHERE idProducto=@idProducto");
      console.log(res.recordset)
      res.json(result.recordset);
     
      if(result.recordset.length>0){
        console.log(result.recordset)
      }else{
       console.log('El producto no ha sido publicado')
      }
  } catch (error) {
      res.status(500);
      res.send(error.message);
  }
  

});



//Funcion para agregar un nuevo producto

const agregarProducto =  express.Router();

agregarProducto.post('/', async (req, res) =>{
  const {idProducto, nombreProducto, descripcionProducto, stock, idUsuario, cantComentarios, cantlikes, instruccionesReceta, fotoProducto, precioProducto} = req.body;
  console.log(idProducto, nombreProducto, descripcionProducto, stock, idUsuario, cantComentarios, cantlikes, instruccionesReceta, fotoProducto, precioProducto);
   try {
         
  const pool = await sql.connect(config);

  const result = await pool.request()
  .input('nombreProducto', sql.VarChar, nombreProducto)
  .input('descripcionProducto', sql.VarChar, descripcionProducto)
  .input('stock', sql.Int, stock)
  .input('idUsuario', sql.Int, idUsuario)
  .input('cantComentarios', sql.Int, cantComentarios)
  .input('cantlikes', sql.Int, cantlikes)
  .input('instruccionesReceta', sql.VarChar, instruccionesReceta)
  .input('fotoProducto', sql.VarChar, fotoProducto)
  .input('precioProducto', sql.Int, precioProducto)
  .query("INSERT INTO productos(nombreProducto, descripcionProducto, stock, idUsuario, cantComentarios, cantlikes, instruccionesReceta, precioProducto)VALUES (@nombreProducto, @descripcionProducto, @stock, @idUsuario, @cantComentarios, @cantlikes, @instruccionesReceta, @precioProducto)")
  console.log(result.recordset)
  res.json('New Producto')
   } catch (error) {
      res.status(500);
      res.send(error.message);
   }
  
});

//Funcion para eliminar un producto

const DeleteProduct = express.Router();

DeleteProduct.delete('/:idProducto', async (req, res) =>{
  const { idProducto } = req.params;
  try {
    const pool = await sql.connect(config);
 const result = await pool.request()
 .input('idProducto', sql.Int, idProducto)
 .query('SELECT idProducto FROM productoPublicado WHERE idProducto=@idProducto');

 if(result.recordset.length >0){
      const pool = await sql.connect(config);
      const deletePro = await pool.request()
      .input('idProducto', sql.Int, idProducto)
      .query('DELETE FROM productoPublicado WHERE idProducto=@idProducto')
      
            if(deletePro.rowsAffected > 0) {
              const pool = await sql.connect(config);
              const deletePro2 = await pool.request()
             .input('idProducto', sql.Int, idProducto)
             .query('DELETE FROM productos WHERE idProducto=@idProducto')
              return res.status(201).json({message:deletePro2.rowsAffected+' Producto Eliminado de Publicados y productos exitosamente'})
            }
           
 }else{
  

      const pool = await sql.connect(config);
      const deletePro3 = await pool.request()
      .input('idProducto', sql.Int, idProducto)
      .query('DELETE FROM productos WHERE idProducto=@idProducto')

      if(deletePro3.rowsAffected > 0) return res.status(201).send({message: deletePro3.rowsAffected+' Producto Eliminado de Productos exitosamente'})
 }


   
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
  
});



const stopSharingProduct = express.Router();

stopSharingProduct.delete('/:idProducto', async (req, res)=>{

  const { idProducto } = req.params;
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
    .input('idProducto', sql.Int, idProducto)
    .query('DELETE FROM productoPublicado WHERE idProducto=@idProducto');
    console.log(result.recordset, ' Productos Eliminados: ', result.rowsAffected);
    res.json('Producto Eliminado de Publicados');
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
})

const formularioRouter = express.Router();

formularioRouter.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/guardar-datos">
      <input type="text" name="nombreUsuario" placeholder="Nombre" required>
      <input type="text" name="apellidoUsuario" placeholder="Apellido" required>
      <input type="text" name="numeroDocumento" placeholder="Numero de Documento" required>
      <input type="text" name="telefono" placeholder="Número de Telefono" required>
      <input type="email" name="correo" placeholder="Correo Electronico" required>
      <input type="text" name="direccion" placeholder="Dirección" required>
      <input type="password" name="passw" placeholder="Contraseña" required>
      <input type="number" name="idRol" placeholder="Rol en Plataforma" required>
      <input type="submit" value="Guardar">
    </form>
  `);
});

const guardarDatosRouter = express.Router();

guardarDatosRouter.post('/', async (req, res) => {
    
  
  
    const nombreUsuario = req.body.nombreUsuario;
    const apellidoUsuario = req.body.apellidoUsuario;
    const numeroDocumento = req.body.numeroDocumento;
    const telefono = req.body.telefono;
    const correo = req.body.correo;
    const direccion = req.body.direccion;
    const passw = req.body.passw;
    const idRol = req.body.idRol;
    

  
    console.log('Valores recibidos:');
    console.log('nombreUsuario:', nombreUsuario);
    console.log('apellidoUsuario:', apellidoUsuario);
    console.log('numeroDocumento:', numeroDocumento);
    console.log('telefono:', telefono);
    console.log('correo:', correo);
    console.log('direccion:', direccion);
    console.log('passw:', passw);
    console.log('idRol:', idRol);

    try {

     
      await sql.connect(config);
  
      const request = new sql.Request();
  
      request.input('nombreUsuario', sql.VarChar, nombreUsuario);
      request.input('apellidoUsuario', sql.VarChar, apellidoUsuario);
      request.input('numeroDocumento', sql.VarChar, numeroDocumento);
      request.input('telefono', sql.VarChar, telefono);
      request.input('correo', sql.VarChar, correo);
      request.input('direccion', sql.VarChar, direccion);
      request.input('passw', sql.NVarChar, passw); // Utiliza sql.NVarChar en lugar de sql.VarChar
      request.input('idRol', sql.Int, idRol);


    // Este query valida que la direccion de correo electronico no exista en la base de datos
    const verifyEmail = await request.query('SELECT correo FROM usuarios WHERE correo=@correo')

    console.log(verifyEmail.recordset[0])
    // Si no existe el la direccion de correo electronico entonces se realiza el registro del nuevo usuario
    if(verifyEmail.recordset[0]===undefined){
      const query = `INSERT INTO usuarios (nombreUsuario, apellidoUsuario, numeroDocumento, telefono, correo, direccion, passw, idRol) VALUES (@nombreUsuario, @apellidoUsuario, @numeroDocumento, @telefono, @correo, @direccion, CONVERT(varbinary(max), @passw), @idRol)`; // Realiza la conversión a varbinary(max) utilizando CONVERT
      const result = await request.query(query)
   
     const respuest = await request.query('SELECT idUsuario, passw from usuarios WHERE correo=@correo')
     const idUser = respuest.recordset[0].idUsuario
     const password = respuest.recordset[0].passw
     console.log(idUser);
     console.log(password);
 
       const token  = await createTokenAccess({ _idUser : idUser });
       res.cookie('token', token);
       console.log(token);
       res.status(201).json({
        message : 'Usuario '+idUser+' password '+password
       });
 
    }else{
      return res.status(500).json({message:'User already registered'})
    }
    
    } catch (error) {
      console.error('Error al solicitar los datos:', error.message);
      res.status(500).send('Error en la respuesta de los datos en la base de datos');
    } 
  });

  
  const loginUser= express.Router();

  loginUser.post('/', async (req, res)=>{
    const {correo, passw} = req.body;
    console.log(correo)
    console.log(passw)

    try {
      const pool = await sql.connect(config)
      const result = pool.request()
      .input('correo', sql.VarChar, correo)
      .input('passw', sql.NVarChar, passw)
      .query('SELECT nombreUsuario, apellidoUsuario, idUsuario, correo FROM usuarios WHERE correo=@correo AND passw=@passw')

       console.log((await result).recordset[0])

  if((await result).recordset.length===0) return res.status(400).send('Error en correo o en la contraseña')
       
      // NOTA: comparar contraseña

      //  const pw = (await result).recordset[0].passw
      //     console.log(pw)
      //  const isMatch = bcrytp.compare(passw, pw)
      //    if(!isMatch) return res.status(400).json({message: ''})
      //       console.log(isMatch)


      console.log((await result).recordset[0])
      const idUser = (await result).recordset[0].idUsuario
      console.log(idUser)
      console.log((await result).recordset[0].passw)
      console.log(passw)
       
        const token  = await createTokenAccess({ _idUser : idUser})
        res.cookie('token', token);
        console.log(token);
       return res.send((await result).recordset[0])

    } catch (error) {
      console.error('Error en la peticion al servidor:', error.message)
      res.status(500).send('Error al guardar los datos en la base de datos')
    }

  });

  // Cerrar la session caducando el token y limpiando la cookie

 export const logoutUser = express.Router();
 logoutUser.post('/', (req, res)=>{
    res.cookie('token', '', {
      expires: new Date(0),
    });
    return res.sendStatus(200)
  });

  const sharePublicProduct=express.Router();
  sharePublicProduct.post('/', async (req, res)=>{
      
    const {idProducto} = req.body;
    console.log(idProducto)

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('idProducto', sql.Int, idProducto)
        .query("INSERT INTO productoPublicado(idProducto)VALUES(@idProducto)");
        console.log(result.recordset, ' New Public Product'); 
        res.json('New Public Product');
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
});

// Rutas protegidos

export const profileUser = express.Router();



profileUser.get('/', async (req, res)=>{
   const {correo} = req.correo;
  const pool = sql.connect(config)
  const result = (await pool).request()
  .input('correo', sql.NVarChar, correo)
  .query('SELECT idUsuario, correo, nombreUsuario, apellidoUsuario FROM usuarios WHERE correo=@correo')

  const response = (await result).recordset[0].idUsuario
  if(response===undefined) return res.status(400).json({message: 'User not Founded'})
   
  res.status(200).json({

  })
})

 const getPublicProducts = express.Router();

  getPublicProducts.get('/', async (req, res) =>{

    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query("SELECT productoPublicado.idPublicado, productos.idProducto, productos.nombreProducto, productos.descripcionProducto, productos.precioProducto, .productos.fotoProducto, usuarios.idUsuario, usuarios.nombreUsuario, usuarios.apellidoUsuario, usuarios.telefono, usuarios.correo FROM productoPublicado INNER JOIN productos ON productoPublicado.idProducto=productos.idProducto INNER JOIN usuarios ON productos.idUsuario=usuarios.idUsuario");
        console.log(result); 
        res.json(result.recordset);
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
});

const getRoles = express.Router();

getRoles.get('/',  async (req, res) =>{

  try {
      const pool = await sql.connect(config);
      const result = await pool.request().query("SELECT  *FROM roles");
      console.log(result); 
      res.json(result.recordset);
  } catch (error) {
      res.status(500);
      res.send(error.message);
  }
})
  

export { formularioRouter, guardarDatosRouter, GetProducts, agregarProducto, DeleteProduct, ObtenerProduct, ObtenerPublicProduct, getPublicProducts, ActualizarProducto, stopSharingProduct, sharePublicProduct, getRoles, loginUser };
