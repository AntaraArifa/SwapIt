import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

export const MeetingPage = () => {
    const {roomCode}=useParams();
   
    
    const myMeeting=async(element)=>{
        const appID=1967862515;
        const serverSecret="d3c4d141dcaa6b0f5b1c2bbfa18b49a5";
        const kitToken=ZegoUIKitPrebuilt.generateKitTokenForTest(appID,serverSecret,roomCode,Date.now().toString(),"Admin");
        const zc=ZegoUIKitPrebuilt.create(kitToken);
        zc.joinRoom({
            container:element,
            sharedLinks:[
                {
                    name:"Copy Link",
                    url:`http://localhost:5173/meeting/${roomCode}`
                }
            ],
            scenario:{
                mode:ZegoUIKitPrebuilt.OneONoneCall,
            },
            showScreenSharingButton:true,
        })
      }
    return(
        <div>
            <div ref={myMeeting}/>
            
        </div>
    )
};