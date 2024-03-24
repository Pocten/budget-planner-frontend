import '../../assets/css/nucleo-icons.css'
import '../../assets/css/nucleo-svg.css'
import '../../assets/css/soft-ui-dashboard.css?v=1.0.3'
import '../../assets/scss/intro.scss'
import React, {useEffect, useRef, useState} from "react";
import image from '../../assets/img/curved-images/curved8.jpg'
import axios from "axios";
import {Link} from "react-router-dom";
import {Carousel} from "react-responsive-carousel";

export const Welcome = () => {

    return (
        <>
            <br/><br/><br/>
            <div className="row ">
                <img style={{height: '600px', borderRadius: '0 0 360px 360px'}} src={image} alt=""/>
            </div>

            <div className="container">
                <h1>Some Public Content</h1>
            </div>
        </>
    )
}
