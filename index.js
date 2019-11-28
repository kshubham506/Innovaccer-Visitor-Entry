var nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');

//===============================================make changes in thsi section

const serverMail="abcde@gmail.com"; //from which mail you want to send the mails
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: serverMail,
    pass: 'pass_of_above_mail make sure allwo access to insecure apps is turned on in gmail'
  }
});


const con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: "",
  database: "innovaccer",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//=======================================================


var express=require('express');
const axios = require('axios');
const app=express();
const path = require('path');
app.use(express.static(__dirname));


async function sendMail(to,from,subject,body){
    const msg = {
      to: to,
      from: from,
      subject: subject,
      text: body,
      html: body,
    };
    try{
    var resp=await transporter.sendMail(msg);
        console.log("Sent")
        return "Successfully Sent!"
    }catch(err){
		console.log(err.substring(0,15))
        return err.substring(0,15)
    }
    
}

async function sendsms(to,msg){
    
    const key=encodeURIComponent("yiAMvK/eHtQ-Of1nkIl2g4GuiAtoWr1hl6mCuvQ4Xp");
  
    try{
        const response=await axios.get('https://api.textlocal.in/send?apikey='+encodeURIComponent(key)+'&numbers='+encodeURIComponent(to)+'&sender='+encodeURIComponent("TXTLCL")+'&message='+encodeURIComponent(msg));

        console.log(response.data);
        if(JSON.stringify(response.data).indexOf("errors")>=0)
            return -1
        else
            return 1
        
    }
    catch (error) {
        console.log(error);
        return -2
    }
}

function getTime(timestamp){
    dateObj = new Date(Number(timestamp) ); 
 
    
    hours = dateObj.getHours(); 

    
    minutes = dateObj.getMinutes(); 


    seconds = dateObj.getSeconds(); 

    formattedTime = hours.toString().padStart(2, '0') + ':' +  
                    minutes.toString().padStart(2, '0') + ':' +  
                    seconds.toString().padStart(2, '0'); 
    return formattedTime

}

//200 ->success , 201->success but sms not sent , 202 -> already checkd in
app.get('/checkin', function(req, res) {
   
    var name=(req.query.name);
    var email=(req.query.email);
    var phone=(req.query.phone);
    var hostname=(req.query.hostname);
    var hostmail=(req.query.hostmail);
    var hostphone=(req.query.hostphone);
    
    var resp={'msg':'','status':'404'};
    
    
    (async () => {
        if(name!=undefined && phone!=undefined && email!=undefined && phone.length>3 && name.length>3 &&  email.length>3) 
        {
            resp.msg={'name':name,'email':email,'phone':phone};
            resp.status="200";
            
            const rows=await con.query("SELECT * FROM checkin where phone='"+phone+"';");
           // console.log(rows[0].length+" , "+JSON.stringify(rows[0]));
            
            
            if(rows[0].length==0)
            {
                var currentTime=Date.now();
               const res=await con.query("insert into checkin(name,email,phone,checkin,checkout) values('"+name+"','"+email+"','"+phone+"','"+currentTime+"','null'   )");
                
                console.log("inserted");
                
                var mailresp=await sendMail(hostmail,serverMail,"You have a new visitor!","<h2>Hi "+hostname+" ,</h2> <br>You have a new visitor today.\<br><br><b><u>Visitor Details:</u></b><br><b>Name : </b>"+name+"<br><b>E-mail : </b>"+email+"<br><b>Phone : </b>"+phone+"<br><br><br>Thank You!");
                
                var ret=await sendsms(hostphone,"You have got a new visitor.\n\nVistor Name :"+name+"\nEmail :"+email+"\nPhone :"+phone);
                
                if(ret==1){
                    resp.status="200";
                    resp.msg="Successfully Checked In.\n"+"Email Status : "+"Email Status : "+mailresp;
                }
                else{
                    resp.status="201"
                    resp.msg="Successfully Checked In but unable to send sms.\n"+"Email Status : "+mailresp;
                }                
            }
            else
            {
                var coutTime=rows[0][0].checkout;
                console.log("Checkout : "+coutTime);
                
                if(coutTime!="null" || coutTime.length>5)
                {
                    //update
                    var currentTime=Date.now();
                    const res=await con.query("update checkin set name='"+name+"', email='"+email+"' ,checkin='"+currentTime+"',checkout='null' where phone='"+phone+"' ;  ");
                     
                    console.log("Updated");
                    
                    var mailresp=await sendMail(hostmail,serverMail,"You have a new visitor!","<h2>Hi "+hostname+" ,</h2> <br>You have a new visitor today.\<br><br><b><u>Visitor Details:</u></b><br><b>Name : </b>"+name+"<br><b>E-mail : </b>"+email+"<br><b>Phone : </b>"+phone+"<br><br><br>Thank You!");
                    
                    var ret=await sendsms(hostphone,"You have got a new visitor.\n\nVistor Name :"+name+"\nEmail :"+email+"\nPhone :"+phone);
                    
                    if(ret==1){
                        resp.status="200";
                        resp.msg="Successfully Checked In.\n"+"Email Status : "+mailresp;
                    }
                    else{
                        resp.status="201"
                        resp.msg="Successfully Checked In but unable to send sms.\n"+"Email Status : "+mailresp;
                    } 
                    
                   
                }
                else
                {
                 
                    console.log("You are already checkd in ");  
                    resp.status="202";
                    resp.msg="You are already checked In . First Check Out to check in again!";
                }
            }
            
            
            
                
                
    
        }
        else{
            resp.msg="Inavlid Parameters!";
            resp.status="404";
        }
        
         res.send(JSON.stringify(resp));
        
    })();
    
    
    
    
   
});

//200 ->success  , 202 -> already checked out ,404->undefined error
app.get('/checkout', function(req, res) {
   
    var name=(req.query.name);
    var email=(req.query.email);
    var phone=(req.query.phone);
    
    var resp={'msg':'','status':'404'};
    
    
    (async () => {
        if(name!=undefined && phone!=undefined && email!=undefined && phone.length>3 && name.length>3 &&  email.length>3) 
        {
            resp.msg={'name':name,'email':email,'phone':phone};
            resp.status="200";
            
            const rows=await con.query("SELECT * FROM checkin where phone='"+phone+"';");
           // console.log(rows[0].length+" , "+JSON.stringify(rows[0]));
            
            
            if(rows[0].length==0)
            {
                console.log("You are already checkd out ");  
                resp.status="202"
                resp.msg="You haven't checked in yet!";
            }
            else
            {
                var coutTime=rows[0][0].checkout;
                console.log("Checkout : "+coutTime);
                
                if(coutTime=="null" || coutTime.length<5)
                {
                    //update
                    var currentTime=Date.now();
                    const res=await con.query("update checkin set name='"+name+"', email='"+email+"',checkout='"+currentTime+"' where phone='"+phone+"' ;  ");
                    
                     
                    console.log("Checkd Out");
                    
                    var mailresp=await sendMail(rows[0][0].email,serverMail,"Details about your visit!","<h2>Hi "+name+" ,</h2> <br>Here are the details regarding your recent visit.\<br><br><b><u>Visit Details:</u></b><br><b>Name : </b>"+name+"<br><b>E-mail : </b>"+email+"<br><b>Phone : </b>"+phone+"<br><b>CheckIn Time : </b>"+getTime(rows[0][0].checkin)+"<br><b>CheckOut Time :</b>"+getTime(currentTime)+"<br><br><br>Thank You!");
                    
                 
                    
                   
                    resp.status="200";
                    resp.msg="Successfully Checked Out!\n"+"Email Status : "+mailresp;
                }
                else
                {
                 
                    console.log("You are already checked out ");  
                    resp.status="202"
                    resp.msg="You have already checked out!";
                }
            }
            
            
            
                
                
    
        }
        else{
            resp.msg="Inavlid Parameters!";
            resp.status="404";
        }
        
         res.send(JSON.stringify(resp));
        
    })();
    
    
    
    
   
});


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var server=app.listen(process.env.PORT || 3000,function() {
    console.log("Server Running on Port 3000 ");
    
});