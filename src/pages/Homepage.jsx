import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { UserObj } from "../StudentInfo";
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//students picture
import student from '../images/user.jpg'
import baduaPic from '../studentPic/136515110030.jpg'


import banez from '../studentPic/406471150053.png'
import bautista from '../studentPic/109403130306.jpg'
import bejarin from '../studentPic/136526131155.jpg'
import bucado from '../studentPic/113815110020.jpg'
import camba from '../studentPic/136526110114.png'
// import cervantes from '../studentPic/48'
import codog from '../studentPic/136515121128.jpg'
import damolo from '../studentPic/136526110160.jpg'
import daniega from '../studentPic/136515120725.jpg'
import docot from '../studentPic/136526110179.jpg'
import escobal from '../studentPic/136526120275.jpg'
// import gabrilo from '../studentPic/136515120'
import hermosa from '../studentPic/136514120007.jpg'
import javier from '../studentPic/136515110136.jpg'
import latona from '../studentPic/136526090480.jpg'
import llanto from '../studentPic/136514120609.jpg'
import macunan from '../studentPic/136526100560.jpg'
import morandarte from '../studentPic/136514121365.png'
import osonia from '../studentPic/136515120734.jpg'
// import padel
import perocillo from '../studentPic/136526120335.jpg'
import sagaysay from '../studentPic/136515100604.jpg'
import sajolGab from '../studentPic/136514121136.jpeg'
import sajolJes from '../studentPic/136526110438.jpg'
import tabor from '../studentPic/158516080143.jpg'
import vinluan from '../studentPic/482818150185.jpg'

import agoncillo from '../studentPic/114692060002.png'
import biasa from '../studentPic/136515121243.jpg'
// import busa 
import gutierez from '../studentPic/303319090143.jpeg'
import hinacay from '../studentPic/136515121251.jpg'
import labordo from '../studentPic/136515120792.jpg'
import magos from '../studentPic/136515120899.jpeg'
import rosales from '../studentPic/136524110747.jpg'


const Homepage = () => {

    const [scanRes, setScanResult] = useState(null);
    const [data, setData] = useState([]);
    const scannerRef = useRef(null);
    const userInf = useRef(null)

    const [sendStatus, setSendStatus] = useState(false)
    const [isDateEq, setIsDateEq] = useState([])
    const [isClear, setIsClear] = useState(false)

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentAmOrPm = currentHour >= 12 ? 'PM' : 'AM';
    const [numOfStudents, setNum] = useState('')
    // Check if current time is past 12:30 PM
    const isPast1230 = currentHour > 12 || (currentHour === 12 && currentMinutes >= 30) && currentAmOrPm === 'PM';
    const currentDate = currentTime.toISOString().split('T')[0]; // Extracting only the date part
    const [loading, setLoading] = useState(false)
    const notifySuccess = () =>
        toast.success(`Student attendance has been updated `, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });

    const notifyError = (name) =>
        toast.error(`${name} already have attendance for this day`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });



    useEffect(() => {
        axios.get('https://melchoraserver.onrender.com/getStatus')
            .then((res) => {
                if (isPast1230) {
                    const learners = UserObj.learners;
                    learners.forEach(learner => {
                        const hasRecords = res.data.some((itm) => parseInt(itm.LRN) === parseInt(learner.LRN) && itm.Date === currentDate);

                        if (!hasRecords) {
                            // Automatically set user to absent status
                            setNum(hasRecords)
                            axios.post('https://melchoraserver.onrender.com/sendStatus', {
                                Date: currentDate,
                                LRN: learner.LRN,
                                Status: 'ABSENT',
                                Time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }).then(() => {
                                console.log(`User ${learner.NAME} set to absent status`);
                            }).catch(error => {
                                console.log(error);
                            });
                        }
                    });
                }
            }).catch((err) => {
                console.log(err);
            });
    }, [scanRes, numOfStudents]);

    const [seeCam, setSeeCam] = useState(false)


    useEffect(() => {
        axios.get('https://melchoraserver.onrender.com/getStatus')
            .then((res) => {
                const filterData = res.data.filter((itm) => parseInt(itm.LRN) === scanRes)
                setIsDateEq(filterData)
                // console.log(filterData)
                setLoading(true)
            }).catch((err) => {
                console.log(err)
            })
    }, [scanRes, seeCam, isDateEq])



    const [studentName, setStudentName] = useState('')


    useEffect(() => {
        if (!seeCam) {
            if (!scannerRef.current) {
                scannerRef.current = new Html5QrcodeScanner('reader', {
                    qrbox: {
                        width: 280,
                        height: 280,
                        aspectRatio: 1
                    },
                    fps: 10,
                });
                scannerRef.current.render(success, error);
            }
            function success(res) {
                const scannedValue = parseInt(res);
                setSeeCam(true)
                setScanResult(scannedValue);
                filterData(scannedValue);
                setSendStatus(true)
                if (scannerRef.current) {
                    scannerRef.current.clear()
                    setIsClear(prev => !prev)
                    const sendDetails = () => {
                        axios.get('https://melchoraserver.onrender.com/getStatus')
                            .then((res) => {
                                const filterData = res.data.filter((itm) => parseInt(itm.LRN) === scannedValue && itm.Date === currentDate);
                                // If there's no attendance record for today for the current user
                                if (filterData.length === 0) {
                                    // Proceed to send attendance record
                                    const currentTime = new Date();
                                    const currentHour = currentTime.getHours();
                                    const currentMinutes = currentTime.getMinutes();
                                    const currentAmOrPm = currentHour >= 12 ? 'PM' : 'AM';
                                    // Adjust hours for AM/PM format
                                    const adjustedHours = currentHour % 12 || 12;

                                    // Construct the time string
                                    const timeString = `${adjustedHours}:${currentMinutes < 10 ? '0' : ''}${currentMinutes} ${currentAmOrPm}`;

                                    // Check if current time is past 5 PM

                                    const presentTime = (currentHour > 6 || (currentHour >= 6 && currentMinutes >= 30)) && currentAmOrPm === 'AM' ? 'PRESENT' : 'LATE';


                                    const currentDate = currentTime.toISOString().split('T')[0]; // Extracting only the date part

                                    console.log(presentTime)

                                    axios.post('https://melchoraserver.onrender.com/sendStatus', {
                                        Date: currentDate,
                                        LRN: scannedValue,
                                        Status: presentTime,
                                        Time: timeString
                                    }).then(() => {
                                        console.log('data sent');
                                        notifySuccess()
                                    }).catch(error => {
                                        console.log(error);
                                    });
                                } else {
                                    const filteredData = UserObj.learners.filter((item) => parseInt(item.LRN) === parseInt(filterData[0].LRN));

                                    notifyError(filteredData[0].NAME)
                                }
                            }).catch((err) => {
                                console.log(err);
                            });
                    };


                    sendDetails()
                }
            }

            function error(err) {

            }
        }
    }, [scanRes, sendStatus, seeCam, studentName]);


    useEffect(() => {
        if (userInf.current && scanRes !== null) {
            window.scrollTo({
                top: userInf.current.offsetTop,
                behavior: 'smooth'
            });
        }
    }, [scanRes]);

    function filterData(scannedValue) {
        const filteredData = UserObj.learners.filter((item) => parseInt(item.LRN) === parseInt(scannedValue));
        setData(filteredData);
        setStudentName(filteredData[0].NAME)
    }



    const getImage = (scanRes) => {
        if (scanRes) {
            return `../studentPic/${scanRes}`
        }
    }
    const DynamicImageSetter = (uniqueId) => {
        // Assuming your image files are named based on the unique ID
        const imagePath = `../studentPic/${uniqueId}.jpg`;

        return <img src={imagePath} alt={`Image for ID ${uniqueId}`} />;
    };


    const setImageForStudents = (scanRes) => {
        const stringiFied = scanRes.toString()
        switch (stringiFied) {
            case "136515110030":
                return <img src={baduaPic} alt="" />;
            case "406471150053":
                return <img src={banez} alt="" />;
            case "109403130306":
                return <img src={bautista} alt="" />;
            case "136526131155":
                return <img src={bejarin} alt="" />;
            case "136526110114":
                return <img src={camba} alt="" />;
            case "482519150177":
                return <img src={student} alt="" />;
            case "136526110160":
                return <img src={damolo} alt="" />;
            case "136515120725":
                return <img src={student} alt="" />;
            case "136526110179":
                return <img src={docot} alt="" />;
            case "136526120275":
                return <img src={escobal} alt="" />;
            case "136515120392":
                return <img src={student} alt="" />;
            case "136514120007":
                return <img src={hermosa} alt="" />;
            case "136515110136":
                return <img src={javier} alt="" />;
            case "136526090480":
                return <img src={latona} alt="" />;
            case "136514120609":
                return <img src={llanto} alt="" />;
            case "136526100560":
                return <img src={macunan} alt="" />;
            case "136514121365":
                return <img src={morandarte} alt="" />;
            case "136515120734":
                return <img src={osonia} alt="" />;
            case "136515100499":
                return <img src={student} alt="" />;
            case "136526120335":
                return <img src={perocillo} alt="" />;
            case "136515100604":
                return <img src={sagaysay} alt="" />;
            case "136514121136":
                return <img src={sajolGab} alt="" />;
            case "136515120725":
                return <img src={daniega} alt="" />;
            case "113815110020":
                return <img src={bucado} alt="" />;
            case "136526110438":
                return <img src={sajolJes} alt="" />;
            case "158516080143":
                return <img src={tabor} alt="" />;
            case "482818150185":
                return <img src={vinluan} alt="" />;
            case "114692060002":
                return <img src={agoncillo} alt="" />;
            case "136515121243":
                return <img src={biasa} alt="" />;
            case "303319090143":
                return <img src={gutierez} alt="" />;
            case "136515121251":
                return <img src={hinacay} alt="" />;
            case "136515120792":
                return <img src={labordo} alt="" />;
            case "136515120899":
                return <img src={magos} alt="" />;
            case "136524110747":
                return <img src={rosales} alt="" />;
            case "136515100160":
                return <img src={student} alt="" />;
            case "136515121128":
                return <img src={codog} alt="" />;
            default:
                return null;
        }

    }

    return (
        <div className="wrapper">
            <ToastContainer />
            {loading === true ?
                <></> :
                (
                    <div className="load">
                        <div className="loader"></div>
                        <div className="text">
                            Loading please wait...
                        </div>
                    </div>
                )}
            <div className='Homepage'>
                <div className="secCon">

                    {!seeCam ?
                        <div id="reader"></div> :
                        <button className='scanAgain' onClick={() => { setSeeCam(false); window.location.reload() }}>Scan Again</button>
                    }

                </div>
            </div>

            {scanRes !== null && (
                <>
                    <div className="studentInfo" ref={userInf}>

                        <div className="userPfp">
                            {data.length === 0 ? <></> : <>{setImageForStudents(scanRes)}</>}
                        </div>

                        <div className='user'>
                            {data.length === 0 && <>NO STUDENT FOUND</>}
                            {data.map((item) => (
                                <div key={item.LRN} className="userCon">
                                    <img src={item.IMG} alt="" />
                                    <div className="inf">
                                        LRN: <span>{item.LRN}</span>
                                    </div>
                                    <div className="inf">
                                        FULLNAME: <span>{item.NAME}</span>
                                    </div>
                                    <div className="inf">
                                        SEX: <span>{item.Sex}</span>
                                    </div>
                                    <div className="inf">
                                        BIRTHDATE:  <span>{item.BIRTH_DATE}</span>
                                    </div>
                                    <div className="inf">
                                        AGE:  <span>{item.AGE}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="tableWrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>LRN</th>
                                    <th>PRESENT</th>
                                    <th>ABSENT</th>
                                    <th>LATE</th>
                                    <th>DATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isDateEq.slice().reverse().map((item) => (
                                    <tr key={item._id}>
                                        <td>{item.LRN}</td>
                                        <td className={` ${item.Status != "PRESENT" ? "" : "presentItem"}`}>{item.Status === "PRESENT" && <div className='iconCon'><ion-icon className="icon" name="checkmark-outline"></ion-icon> </div>} </td>
                                        <td className={` ${item.Status != "ABSENT" ? "" : "absentItem"}`}>{item.Status === "ABSENT" && <div className='iconCon'><ion-icon className="icon" name="checkmark-outline"></ion-icon> </div>}</td>
                                        <td className={` ${item.Status != "LATE" ? "" : "lateItem"}`}>{item.Status === "LATE" && <div className='iconCon'> <ion-icon className="icon" name="checkmark-outline"></ion-icon> </div>}</td>
                                        <td>
                                            <span>{item.Date} </span>
                                            <span> {"|" + " " + item.Time}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>

            )}





        </div>
    );
}

export default Homepage;
