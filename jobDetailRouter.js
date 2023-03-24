
var express = require('express');
var mongoose = require('mongoose');
var multer  = require('multer');
var mustache       = require('mustache');
var async          = require('async');
var moment 		   = require('moment');
var redis 	       = require('redis');


var JobDetailLib   = require('../../../lib/classJobDetail');
var JobHeaderLib   = require('../../../lib/classJobHeader');
var HtmlLib	       = require('../../../lib/classHtml');
const fs           = require("fs");
var LineByLineReader 	= require('line-by-line');

var jobD = new JobDetailLib();
var jobH = new JobHeaderLib();
var html = new HtmlLib();
var router = express.Router();

PublishClient      = redis.createClient();

function ShowJobHeader(Resp, loggedInUser, req, res){
	let frame = {};
	let page = html.GetPage(null);
	frame.ext = html.GetPage('jobheader');
	let Data = html.GetEmptyPage(loggedInUser);

	if(req.session.UserPriv.indexOf('ViewJob') >= 0){
		Data.Granted = true;
	}

	let htmlpage = mustache.render(page, Data, frame);
	res.send(htmlpage);
} /* ShowJobHeader */

function ShowJobDetail(Resp, loggedInUser, req, res){
	let frame = {};
	let page = html.GetPage(null);
	frame.ext = html.GetPage('jobdetail');
	let Data = html.GetEmptyPage(loggedInUser);

	Data.Filter = ' ';

	if(req.query.id){
		Data.Filter = req.query.id;
	}

	if(req.session.UserPriv.indexOf('ViewJob') >= 0){
		Data.Granted = true;
	}

	let htmlpage = mustache.render(page, Data, frame);
	res.send(htmlpage);
} /* ShowJobDetail*/

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {             
        cb(null, "Temp.tmp")
    }
});
  
const upload = multer({ storage: storage });


router.post('/upload',html.requireLogin,upload.single('upload'),(req,res) =>{
    //Changing the name of the file to the original name
    fs.rename('uploads/Temp.tmp', 'uploads/'+req.file.originalname, function(err) {
        if (err) {
            console.log(err);
            return res.json({status: 'Failed', Err: err});
        }

        console.log('File Renamed!');

        ReadAndInsert("uploads/"+req.file.originalname, function(Resp){
            if(Resp.Err){
                console.log(err);
                return res.json({status: 'Failed', Err: Resp.Err});
            }
    
          // return res.json({status: 'Data successfully'});
        });
    });
});



function ReadAndInsert(filepath, callback){
    let lrNew = new LineByLineReader(filepath);

	lrNew.on('error', function (err){
        return callback({Err: err});
	});

   

    lrNew.on('line', function (line) {
let arrays = line.split("|");
const data = arrays;



   let newJob = {
    Production_Batch: data[0],
    Print_Batch : data[1],
    Client_Name : data[2],
    Client_Address : data[3],
    Double_Dispensing_Indicator : data[4],
    Date_Dispensed : data[5],
    Script_Number : data[6],
    Item_Count : data[7],
    Drug_Description : data[8],
    Dosage_Line_1 : data[9],
    Dosage_Line_2 : data[10],
    Dosage_Line_3 : data[11],
    Dosage_Line_4 : data[12],
    Title : data[13],
    Initials : data[14],
    Surname : data[15],
    Repeat : data[16],
    Pharmacist : data[17],
    File_No : data[18],
    Batch : data[19],
    Expiry : data[20],
    Lane : data[21],
    FCY : data[22],
    SQ : data[23],
    Order_No : data[24],
    Line_No : data[25],
    Hospital_Ref : data[26],
    Production_Batch_1 : data[27],
    Production_Batch_2 : data[28],
    Production_Expiry : data[29],
    Surname : data[30],
    Name : data[31],
    Fridge : data[32],
    SSEQ : data[33],
    Date_Of_Birth : data[34],
    Date_Dispensed : data[35],
    Cell_No : data[36],
    ID_Number : data[37],
    File_No : data[38],
    Collection_Date : data[39],
    Next_Collection_Date : data[40],
    Collection_Point : data[41],
    Profile_No : data[42],
    Script_Number : data[43],
    Repeat : data[44],
    Item_Count : data[45],
    Repeat_Notice : data[46],
    Following_Items_Not_Included : data[47],
    Line_1 : data[48],
    Line_2 : data[49],
    Line_3 : data[50],
    Line_4 : data[51],
    Facility_Review : data[52],
    Parcel_Ref : data[53],
    Collection_Point_Ref : data[54],
    Collection_Date : data[55],
    MpNo : data[56],
    Name : data[57],
    Surname : data[58],
    Hub : data[59],
    Zone : data[60],
    Second_Rx_Ref : data[61],
    Fridge : data[62],
    Parcel_Reference_Number : data[63],
    MAN_SEQ: data[64],
    SEQUENCE: data[65]
   }
   populateJobHeader(newJob);

   jobD.New(newJob, function(Resp){
    if(Resp.Err){
     console.log(Resp.Err);
    }
});

	});
	lrNew.on('end', function (){
       return callback({Err: null});
    });
}

function populateJobHeader(newJob)
{
//let data = newJob;

let newJobHeader = {
    Production_Batch: newJob.Production_Batch,
    Print_Batch: newJob.Print_Batch,
    Collection_Point: newJob.Collection_Point,
    Collection_Point_Ref: newJob.Collection_Point_Ref
}

jobH.New(newJobHeader,function(Resp){
    if(Resp.Err)
    {
        console.log(Resp.Err);
    }
});
}

router.get('/API/jobheader', html.requireLogin, function (req, res) {
	let loggedInUser = req.session.username;

	ShowJobHeader(null, loggedInUser, req, res);
});

router.get('/API/jobdetail', html.requireLogin, function (req, res){
	let loggedInUser = req.session.username;

	ShowJobDetail(null, loggedInUser, req, res);
});



router.post('/API/DTGetJobHeader', html.requireLogin, function (req, res){
	let loggedInUser = req.session.username;

	jobH.DtGetData(req, loggedInUser, function(Resp){
		console.log(Resp);
		res.send(Resp);
	});
});

router.post('/API/DTGetJobDetail', html.requireLogin, function (req, res){
	let loggedInUser = req.session.username;

	jobD.DtGetData(req, loggedInUser, function(Resp){
		//console.log(Resp);
		res.send(Resp);
	});
});

module.exports = router;