import React, { useState, useEffect } from 'react';

function useResize() {
    const [windowWidth, setwindowWidth] = useState(window.innerWidth);
    window.addEventListener("resize", () => setwindowWidth(window.innerWidth));

    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("trigger timer");
            setCanvasSize();
        }, 100);

        return () => {
            clearTimeout(timer);
        }
    }, [windowWidth])

    const setCanvasSize = () => {
        const canvas = document.getElementById("preview");
        const ctx = canvas.getContext("2d"); //取得Dom元素

        if (windowWidth > 768) {
            //將畫布比例縮小至1578 * 1080
            const scaleX = 0.7095323741;
            const scaleY = 0.64748201438;
            ctx.canvas.width = 1578;
            ctx.canvas.height = 1080;
            ctx.scale(scaleX, scaleY);

            const buttonHeight = document.getElementById("preview").height - 200;
            const prevButton = document.getElementsByClassName("btn-prev")[0];
            prevButton.style.top = `${buttonHeight}px`;
            prevButton.style.left = `${100 * scaleX}px`;

            const canvasWidth = document.getElementById("preview").width;
            const buttonSize = document.getElementsByClassName("btn-page")[0].clientWidth;

            const nextButton = document.getElementsByClassName("btn-next")[0];
            nextButton.style.top = `${buttonHeight}px`;
            nextButton.style.left = `${canvasWidth - (100 * scaleX) - buttonSize}px`;
        }
    }


}

export default useResize;