import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from 'react';
import { drawBackgroundImage, drawText, drawAccessories, drawCharacter } from './../functions/draw';
import useResize from '../Hooks/useResize';

function Storyviewer() {

    const { bookid } = useParams();
    const [page, setpage] = useState(0);
    const [allcontent, setallcontent] = useState([]);
    const [isButtonDisabled, setisButtonDisabled] = useState(false);

    //取得所有的書籍內容
    useEffect(() => {
        fetch(`https://toysrbooks.com/dev/v0.1/getBookPage.php?book_id=${bookid}&token=eyJhbGciOiJIUzIEc9mz`)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                setallcontent(res.book_pages);
            })
            .catch((err) => {
                console.log("error message:", err);
            })
    }, [])

    //繪畫Function
    const draw = async () => {
        const currentContent = allcontent[page];
        console.log("doDraw");
        console.log("currentContent", currentContent);

        const canvas = document.getElementById("preview");
        const ctx = canvas.getContext("2d"); //取得Dom元素

        ctx.clearRect(0, 0, 2224, 1668) //清空畫布

        //防止還未取得資料時執行
        if (!currentContent) {
            setisButtonDisabled(false); //將按鈕啟動
            return
        }

        await drawBackgroundImage(ctx, currentContent) //繪製底圖
        await drawAccessories(ctx, currentContent); //繪製配件
        await drawCharacter(ctx, currentContent); //繪製角色
        drawText(ctx, currentContent); //繪製文字

        setisButtonDisabled(false); //繪畫完成後即可跨到下一頁
    }


    //處理RWD
    const [windowWidth, setwindowWidth] = useState(window.innerWidth);
    const debounce = (func) => {
        let timer;
        return () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(func, 1000);
        };
    }

    useEffect(() => {
        resize();
        window.addEventListener("resize", debounce(() => {
            resize();
            setwindowWidth(window.innerWidth);
        }));
    }, []);

    
    const resize = useCallback(() => {
            const canvas = document.getElementById("preview");
            const ctx = canvas.getContext("2d"); //取得Dom元素
            let scaleX
            let scaleY
            console.log("setCanvasSize");

            //原尺寸2224 * 1668
            ctx.resetTransform();

            //取得使用者的視窗大小減掉 342 使最大尺寸為1578
            const resizedCanvasWidth = window.innerWidth - 342;

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
        },[windowWidth])
        

    //換頁時重新繪畫
    useEffect(() => {

        draw();

        return () => {
            //未載入畫面前不可前往下一頁
            setisButtonDisabled(true);
        }
    }, [page, allcontent , resize]);

    return (
        <div className='container'>
            <canvas id="preview" width="2224" height="1668">
                無此內容!
            </canvas>
            <button className="btn-page btn-prev" disabled={isButtonDisabled} onClick={() => setpage(prevPage => prevPage - 1)}></button>
            <button className="btn-page btn-next" disabled={isButtonDisabled} onClick={() => setpage(prevPage => prevPage + 1)}></button>
        </div>
    );
}

export default Storyviewer;