import sql from 'mssql'

const config = {
  user: 'xiaocook',
  password: 'abc123',
  server: 'localhost',
  database: 'xiaocook',
  port: 1433,
  options: {
    trustServerCertificate: true
  }
};

const GetConection = async()=>{
  try {
    const ConectDB = sql.connect(config, ()=>console.log('Connected DataBase...'));
  } catch (error) {
    console.log(error)
  }
}


export { config, GetConection };
  