import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser'
import sql from 'mssql';
import { config, GetConection } from './config.js';
import { formularioRouter, guardarDatosRouter, GetProducts, agregarProducto, DeleteProduct, ObtenerProduct, ObtenerPublicProduct, getPublicProducts, ActualizarProducto, stopSharingProduct, sharePublicProduct, getRoles, loginUser, logoutUser, profileUser } from './routes.js';
import { inicioSesion, usuarioInside, } from './login.js';
import { confirmAuthen } from './midlewares/tokenValidation.js';
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(cors());


app.use(
    cors({
      origin: 'http://localhost:3000', 
      optionsSuccessStatus: 200 
    })
  );
  

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser()); // Manejar y acceder de forma sencilla a las cookies


app.use('/formulario', formularioRouter);
app.use('/guardar-datos', guardarDatosRouter);
app.use('/Registro', getRoles);
app.use('/login', loginUser);
app.use('/logout', logoutUser);
app.use('/profile', confirmAuthen, profileUser);
app.use('/Producto_usua', GetProducts);
app.use('/Producto_usua/', ObtenerProduct);
app.use('/Producto_usua/', ActualizarProducto);
app.use('/Producto_usua/', DeleteProduct)
app.use('/FormuProduct', agregarProducto);
app.use('/Producto_publicado/',ObtenerPublicProduct);
app.use('/publicProducts', getPublicProducts);
app.use('/publicProducts/', sharePublicProduct);
app.use('/publicProducts/', stopSharingProduct);



// Imprime todas las rutas definidas en la aplicación
console.log(app._router.stack.map((middleware) => {
  if (middleware.route) {
    // Ruta definida directamente
    return middleware.route.path || '(ruta sin especificar)';
  } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
    // Ruta definida en un enrutador
    return middleware.handle.stack.map((handler) => {
      if (handler.route) {
        return handler.route.path || '(ruta sin especificar)';
      } else {
        return '(ruta sin especificar)';
      }
    });
  }
}).filter(Boolean));



const port = 3001;

app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});

GetConection();


