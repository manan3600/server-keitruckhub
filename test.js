import { connect, Schema, model } from "mongoose";

//testdb is name of database, it will automatically make it
connect("mongodb+srv://manan29501_db_user:AqkrAeGyJYbSXzy5@cluster0.h9t7k5i.mongodb.net/")
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

const schema = new Schema({
  name: String,
});

async function createMessage() {
  const result = await message.save();
  console.log(result);
}

//this creates a Message class in our app
const Message = model("Message", schema);
const message = new Message({
  name: "Hello World",
});

createMessage();
