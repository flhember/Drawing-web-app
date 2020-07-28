import React, { useRef, useEffect, useState } from 'react';
import '../App.css';
import pen from '../img/pen.png';
import bin from '../img/bin.png';
import rubber from '../img/rubber.png';
import io from "socket.io-client";

let socket;

function Drawing() {

    const refCanvas = useRef(null)
    const refContext = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('black');
    const [sizeD, setSizeD] = useState(3);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    //const ENDPOINT = 'https://expratico.netlify.app/';
    const ENDPOINT = 'http://localhost:5000/';

    useEffect(() => {
        socket = io(ENDPOINT);
    }, [ENDPOINT]);
    
    const onResize = () => {
        const canvas = refCanvas.current;
        canvas.width = document.documentElement.clientWidth - 8;
        canvas.height = document.documentElement.clientHeight / 1.3;
      };

    const clickPen = () => {
        setColor('black')
        setSizeD(3)
    }

    const clickRubber = () => {
        setColor('white')
        setSizeD(50)
    }

    const clickClean = () => {
        socket.emit('clean', true)
    }

    useEffect(() => {
        
        const canvas = refCanvas.current;

        canvas.width = document.documentElement.clientWidth - 8;
        canvas.height = document.documentElement.clientHeight / 1.3;

        console.log(canvas.height)


        window.addEventListener("resize", onResize);

        const context = canvas.getContext("2d")
        context.linecap = "round"
        context.strokeStyle = 'black';
        context.lineWidth = 3
        refContext.current = context;
   
        socket.on('drawio', data => {
            let w = window.innerWidth - 8;
            let h = window.innerHeight / 1.3;
            drawNow(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, false);
        });

        socket.on('clean', () => {
            refContext.current.clearRect(0, 0, window.innerWidth - 8, window.innerHeight / 1.3)
        });
    }, [])

    const startDrawing = ({nativeEvent}) => {
        var rect = nativeEvent.target.getBoundingClientRect();
        const {offsetX, offsetY} = nativeEvent;
        setPosX(offsetX || nativeEvent.touches[0].clientX - rect.left)
        setPosY(offsetY || (nativeEvent.touches[0].clientY - rect.top))
        setIsDrawing(true)
    }

    const drawing = ({nativeEvent}) => {
        var rect = nativeEvent.target.getBoundingClientRect();
        if (!isDrawing) {
            return
        }
        const {offsetX, offsetY} = nativeEvent;
        setPosX(offsetX || nativeEvent.touches[0].clientX - rect.left)
        setPosY(offsetY || (nativeEvent.touches[0].clientY - rect.top))
        drawNow(posX, posY, offsetX || nativeEvent.touches[0].clientX - rect.left, offsetY || (nativeEvent.touches[0].clientY - rect.top), color, sizeD, true);
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const drawNow = (x0, y0, x1, y1, color, sizeD, emit) => {
        refContext.current.beginPath();
        refContext.current.strokeStyle = color;
        refContext.current.lineWidth = sizeD;
        refContext.current.moveTo(x0, y0);
        refContext.current.lineTo(x1, y1);
        refContext.current.stroke();
        refContext.current.closePath();

        //Ah chaque dessin, envoie des infos a "drawio"
        var w = window.innerWidth - 8;
        var h = window.innerHeight / 1.3;
        //seulement si c'est un dessin et pas un retour d'info pour socket
        if (!emit)
            return
        socket.emit('drawio', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color,
            size: sizeD
        });
    }

    //Limite les appelles de drawing
    const throttle = (callback, delay) => {
        let previousCall = new Date().getTime();
        return function() {
          let time = new Date().getTime();
    
          if (time - previousCall >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
          }
        };
      }

     return (
         <div>
            <div className= 'monCadre'>
                <canvas 
                    onMouseDown={startDrawing}
                    onTouchStart={startDrawing}
                    onMouseMove={throttle(drawing, 5)}    
                    onTouchMove={throttle(drawing, 5)}
                    onMouseUp={stopDrawing}
                    onTouchEnd={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchCancel={stopDrawing}
                    ref={refCanvas}
                />
            </div>
            <div className= 'tools'>
                <input type="image"  accept=".png" id="image" alt="penB" src={pen} onClick={clickPen}/>
                <input type="image"  accept=".png" id="image" alt="rubB" src={rubber} onClick={clickRubber}/>
                <input type="image"  accept=".png" id="image" alt="binb" src={bin} onClick={clickClean}/>
            </div>
        </div>
    );
}

export default Drawing;
