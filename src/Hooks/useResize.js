import React, { useState, useEffect } from 'react';

function useResize() {
    const [firstLoad, setfirstLoad] = useState(true);
    const [windowWidth, setwindowWidth] = useState(window.innerWidth);
    window.addEventListener("resize", () => setwindowWidth(window.innerWidth));
    //避免Line16提早和Line10重複執行
    window.addEventListener("resize", () => setfirstLoad(false));

    //剛Load進執行
    useEffect(() => {
        setCanvasSize();
    }, [])


    useEffect(() => {
        //避免首次重複執行
        if (firstLoad === true) return

        const setCanvastimer = setTimeout(() => {
            setCanvasSize();
        }, 2000);

        return () => {
            clearTimeout(setCanvastimer);
        }
    }, [windowWidth]);

    const setCanvasSize = () => {
        const canvas = document.getElementById("preview");
        const ctx = canvas.getContext("2d"); //取得Dom元素
        let scaleX
        let scaleY
        console.log("setCanvasSize");

        //原尺寸2224 * 1668
        ctx.resetTransform();

        //取得使用者的視窗大小減掉 342 使最大尺寸為1578
        const resizedCanvasWidth = windowWidth - 342;

        //透過比例算出畫布適合高度
        const ratio = resizedCanvasWidth / 2224;
        const resizedCanvasHeight = 1668 * ratio > 1080 ? 1080 : 1668 * ratio;

        //設定畫布大小及縮放
        ctx.canvas.width = resizedCanvasWidth;
        ctx.canvas.height = resizedCanvasHeight;
        scaleX = resizedCanvasWidth / 2224
        scaleY = resizedCanvasHeight / 1668;
        ctx.scale(scaleX, scaleY);


        //設定按鈕大小
        const prevButton = document.getElementsByClassName("btn-prev")[0];
        const nextButton = document.getElementsByClassName("btn-next")[0];

        //設定按鈕位置
        const buttonHeight = resizedCanvasHeight - 200;
        prevButton.style.top = `${buttonHeight}px`;
        prevButton.style.left = `${100 * scaleX}px`;

        const canvasWidth = document.getElementById("preview").width;
        const buttonSize = document.getElementsByClassName("btn-page")[0].clientWidth;

        nextButton.style.top = `${buttonHeight}px`;
        nextButton.style.left = `${canvasWidth - (100 * scaleX) - buttonSize}px`;
        return
    }


}

export default useResize;