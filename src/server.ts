import { config } from "dotenv";
import app from "./app";
config();

const startServer = () => {
  const { PORT } = process.env;
  try {
    app.listen(PORT, () => {
      console.log(`app is running at port ${PORT}`);
    });
  } catch (error) {
    console.log("Error occured while starting the server", error);

    process.exit(1);
  }
};
startServer();
