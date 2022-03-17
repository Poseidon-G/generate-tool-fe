import logo from './logo.svg';
import React, { useState, useRef, useEffect } from 'react';
import {saveAs} from "file-saver"
import './App.css';
import { Input, Button} from '@mui/material';
import Papa from "papaparse"
import axios from "axios"
import JSZip from 'jszip';
import UnstyledTable from './components/Table';
import VerticalLinearStepper from './Stepper';

function App() {
  const fileInput = useRef(null)
  const [fileData, setFileData] = useState()
  const [listImageNotSaved, setListImageNotSaved] = useState([])
  const [activeState, setActiveState] = useState(0)
  const [isFailedStep, setIsFailedStep] = useState(null)

  useEffect(()=>{
     setActiveState(0)
     setListImageNotSaved([])
  }, [fileData])

  const handleClick = () => {
    fileInput.current.click()
  }

  const handleFileChange = event => {
    setFileData(event.target.files[0])
  }

  //seperate multi func :D 
  //handle parse Data CSV

  const handleFileDataCSV = async (fileData) => {
    try{
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
      let parseData = (await promiseParseData).data;
      parseData = parseData.filter((item) => item.length === 2)
      //get data Json
      return parseData
    }
    catch(err){
      throw err
    }
  }
  
  const callApiDownloadImages = async (parseData) => {
    try{
      let listResponsePromise = []
      let imageNotSaved = []
      let imageSaved = []

      //Download images multi async
      for(let i =0; i < parseData.length; i ++){
        const response = axios.post('http://64.227.85.213:8443/api/v1/dowloadImages', {
          "url": parseData[i][1],
          "fileName": parseData[i][0]
        })
        listResponsePromise.push(response)
      }
      
      listResponsePromise = await Promise.all([...listResponsePromise])
      
      for (let i = 0; i < listResponsePromise.length; i++ ) {
        if(listResponsePromise[i].data["ErrorCode"] === 2){
          imageNotSaved.push(listResponsePromise[i].data.data)
        }
        if(listResponsePromise[i].data.data.imageBase64){
          imageSaved.push(listResponsePromise[i].data.data)
        }
      }

      setListImageNotSaved(imageNotSaved)
      return imageSaved
    }
    catch(err){
      throw err 
    }
  }
  
  const downloadZipFileToLocal = async (listImageSaved) => {
    try{
      // handle zip file downloading
      var zip = new JSZip();
      var img = zip.folder("images");

      for(const imageSaved of listImageSaved){
        img.file(imageSaved.fileName, imageSaved.imageBase64, {base64: true});
      }

      const result = new Promise((resolve, reject) => {
          zip.generateAsync({type:"blob"}).then(function(content) {
          // see FileSaver.js
            saveAs(content, "example.zip");
            resolve(true)
          }).catch((err)=>{
            reject(err)
          })
      }
      );
      return result;
    }
    catch(err){
      throw err
    }
  }

  const processingDowloadImages = async (parseData) => {
    let activeStepPerform = 0;
    try{
      activeStepPerform ++;
      setActiveState(activeStepPerform)
      const dataInfo = await handleFileDataCSV(parseData);
      activeStepPerform ++;
      setActiveState(activeStepPerform)
      const listImageSaving = await callApiDownloadImages(dataInfo);
      activeStepPerform ++;
      setActiveState(activeStepPerform)
      await downloadZipFileToLocal(listImageSaving)
      activeStepPerform ++;
      setActiveState(activeStepPerform)
    }
    catch(err){
      console.log(err)
      setIsFailedStep(activeStepPerform)
      setActiveState(4)
    }

  }

  return(
    <div className="App">
      {/* <BasicModal openModel={handleOpenModel}/> */}
      
      <div className="upload input file">
          <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileChange(e)}
              ref={fileInput} 
          />
          <div onClick={() => handleClick()}></div>
      </div>

      <Button onClick={() => processingDowloadImages(fileData)}>Parse JSon</Button>

      <VerticalLinearStepper inputActiveStep={activeState} isFailedStep={isFailedStep} />

      <UnstyledTable rows={listImageNotSaved}></UnstyledTable>
    </div>
  )
}

export default App;
