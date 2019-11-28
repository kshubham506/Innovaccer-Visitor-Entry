# Innovaccer-Visitor-Entry
Innovaccer Visitor Entry System

**A live demo can be found here : http://18.222.212.235:3000/**

# Screenshots

![homepage](https://github.com/kshubham506/Innovaccer-Visitor-Entry/blob/master/img/homepage.png)

![checkin](https://github.com/kshubham506/Innovaccer-Visitor-Entry/blob/master/img/check_in.png) 
![checkinout](https://github.com/kshubham506/Innovaccer-Visitor-Entry/blob/master/img/check_out.png)


**The site is fully repsonsive.**

**Technologies Used :** Node Js, MySql

**Steps to run on your system**
1. Make sure you have node js and Mysql installed on your system
2. Pull or Clone this repository
3. Import the innovaccer_db.sql databse file into your mysql database.
4. No open ```index.js``` file and:
    - At the start of the file enter the gmail id from which you want to send the email to the visitor and host and also enter the password for the same account.
    ![email_set](https://github.com/kshubham506/Innovaccer-Visitor-Entry/blob/master/img/email_set.png)
    
    - Also enter the user name and password for your mysql database
    ![databse_set](https://github.com/kshubham506/Innovaccer-Visitor-Entry/blob/master/img/db_set.png)
5. That's all now open cmd and move to the project folder.
6. Start the server by typing in
    ```node index.js```
7. Access the site by visiting ```http://localhost:3000``` in your browser

**Note**
  - For sending text messages textlocal free api has been used . It provides 10 free sms , but we can't send sms to numbers in DND List and between 9PM - 9AM. 
  - That's why most of the time the site says sms sending failed.
  - This api can easily be changed in the ```sendSms function``` in ```index.js``` file
  


