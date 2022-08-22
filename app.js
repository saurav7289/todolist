const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// const items = ["cook food","eat food","serve food"];
// const workitems = [];

app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb+srv://saurav7289:root@cluster0.3pszgd5.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.log(err))

const itemSchema = {
    name: String
};

const Item= mongoose.model("Item", itemSchema); 

const item1 = new Item({
    name:"Welcome to your todolist"
});

const item2 = new Item({
    name:"Hit the + button to add a new item"
});

const item3 = new Item({
    name:"<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);





app.get("/",function(req,res){

Item.find({},function(err, foundItems){
    if(foundItems.length === 0){

     Item.insertMany(defaultItems, function(err){
    if(err){
        console.log(err);
    }else{
        console.log("successfully saved default items to DB");
    }
});

res.redirect("/");
    }else{
        res.render("list",{listTitle: "Today", newListItems: foundItems});
    }
});
      
});


app.get("/:topicTitle", function(req,res){
    const topicTitle = _.capitalize(req.params.topicTitle);
    List.findOne({name: topicTitle}, function(err, foundList){
        if(!err){
            if(!foundList){

                const list = new List({
                    name: topicTitle,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + topicTitle);
          }else{
            res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
          }
        }
    });
});





app.post("/",function(req,res){

    var itemName = req.body.newItem;
    var listName = req.body.list;

    const item = new Item({
        name:itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }

  
    
});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if( listName === "Today"){

        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("successfully deleted checked item");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}}, function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }  
});




app.listen(3000,function(){
    console.log("server is at port 3000!");
});