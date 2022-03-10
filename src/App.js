import logo from './logo.svg';
import React, { useState, useRef } from 'react';
import {saveAs} from "file-saver"
import './App.css';
import { Input, Button} from '@mui/material';
import Papa from "papaparse"
import axios from "axios"
import JSZip from 'jszip';
import UnstyledTable from './components/Table';

function App() {
  const fileInput = useRef(null)
  const [fileData, setFileData] = useState()
  const [rowDataNotSaved, setRowDataNotSaved] = useState([])
  const handleClick = () => {
    fileInput.current.click()
  }

  const handleFileChange = event => {
    setFileData(event.target.files[0])
  }

  const handleFileDataCSV = async (fileData) => {
    var start = new Date().getTime();
    //promise for function not async
    const promiseParseData = new Promise((resolve, reject) => {
      Papa.parse(fileData, {
        complete (results, fileData) {
          resolve(results)
        },
        error (err, fileData) {
          reject(err)
        }
      })
    })
    //get data Json
    
    const listImageSaved = []
    const listImageNotSaved = []
    let listResponsePromise = []
    let parseData = (await promiseParseData).data;
    parseData = parseData.filter((item) => item.length === 2)
    console.log(parseData)
    // //Download images multi async
    for(let i =0; i < parseData.length; i ++){
      const response = axios.post('http://35.171.154.180:8443/api/v1/dowloadImages', {
        "url": parseData[i][1],
        "fileName": parseData[i][0]
      })
      listResponsePromise.push(response)
    }
    
    listResponsePromise = await Promise.all([...listResponsePromise])
    
    for (let i = 0; i < listResponsePromise.length; i++ ) {
      console.log(listResponsePromise[i])
      if(listResponsePromise[i].data["ErrorCode"] === 2){
        listImageNotSaved.push(listResponsePromise[i].data.data)
      }
      if(listResponsePromise[i].data.data.imageBase64){
      listImageSaved.push(listResponsePromise[i].data.data)
      }
    }

    setRowDataNotSaved(listImageNotSaved)

    var zip = new JSZip();
    var img = zip.folder("images");

    for(const imageSaved of listImageSaved){
      img.file(imageSaved.fileName, imageSaved.imageBase64, {base64: true});
    }

    zip.generateAsync({type:"blob"}).then(function(content) {
      // see FileSaver.js
      saveAs(content, "example.zip");
    });

    var end = new Date().getTime();
    var time = end - start;

    console.log('Total Execution time: ' + time/(60*1000)+ "p");

    console.log("Total image can down", listImageSaved.length)
    console.log("Total image can't down", listImageNotSaved.length)
  }


  return(
    <div className="App">
      <div className="upload input file">
          <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileChange(e)}
              ref={fileInput} 
          />
          <div onClick={() => handleClick()}></div>
      </div>
      <Button onClick={() => handleFileDataCSV(fileData)}>Parse JSon</Button>
      <UnstyledTable rows={rowDataNotSaved}></UnstyledTable>
    </div>
  )
}

export default App;
