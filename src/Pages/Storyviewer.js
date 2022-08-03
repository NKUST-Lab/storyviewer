import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from 'react';
import { drawBackgroundImage, drawText, drawAccessories, drawCharacter } from './../functions/draw';

function Storyviewer() {

    const { bookid } = useParams();
    const [total_page_number, settotal_page_number] = useState(0);
    const [page_number, setpage_number] = useState(0);
    const [book_page_content, setbook_page_content] = useState([]);
    const [is_button_disabled, setis_button_disabled] = useState(false);

    //取得所有的書籍內容
    useEffect(() => {
        fetch(`https://toysrbooks.com/dev/v0.1/getBookPage.php?book_id=${bookid}&token=eyJhbGciOiJIUzIEc9mz`)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                setbook_page_content(res.book_pages);
                settotal_page_number(res.book_pages.length);
            })
            .catch((err) => {
                console.log("error message:", err);
            })
    }, [])

    //繪畫Function
    const draw = async () => {
        const currentContent = book_page_content[page_number];
        console.log("doDraw");
        console.log("currentContent", currentContent);

        const canvas = document.getElementById("preview");
        const ctx = canvas.getContext("2d"); //取得Dom元素

        ctx.clearRect(0, 0, 2224, 1668) //清空畫布

        //防止還未取得資料時執行
        if (!currentContent) {
            setis_button_disabled(false); //將按鈕啟動
            return
        }

        await drawBackgroundImage(ctx, currentContent) //繪製底圖
        await drawAccessories(ctx, currentContent); //繪製配件
        await drawCharacter(ctx, currentContent); //繪製角色
        drawText(ctx, currentContent); //繪製文字

        setis_button_disabled(false); //繪畫完成後即可跨到下一頁
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
        handleSetPage(0);
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

        //取得使用者的視窗大小使Canvas等於視窗大小的0.9
        let resizedCanvasWidth = window.innerWidth * 0.9

        //透過比例算出畫布適合高度
        let ratio = resizedCanvasWidth / 2224;
        let resizedCanvasHeight = 1668 * ratio

        if (resizedCanvasHeight > window.innerHeight) {
            resizedCanvasHeight = window.innerHeight
            ratio = resizedCanvasHeight / 1668
            resizedCanvasWidth = 2224 * ratio
        }


        //設定畫布大小及縮放
        ctx.canvas.width = resizedCanvasWidth;
        ctx.canvas.height = resizedCanvasHeight;
        scaleX = resizedCanvasWidth / 2224
        scaleY = resizedCanvasHeight / 1668;
        ctx.scale(scaleX, scaleY);


        //設定按鈕大小
        const prevButton = document.getElementsByClassName("btn-prev")[0];
        const nextButton = document.getElementsByClassName("btn-next")[0];
        //Every 25px from 1920 to userWindow reduce the size of Buttons 1px
        const responsivecondition = (1920 - window.innerWidth) / 25
        const buttonSize = 150
        const resizedButtonSize = buttonSize - responsivecondition
        prevButton.style.width = `${resizedButtonSize}px`;
        prevButton.style.height = `${resizedButtonSize}px`;
        nextButton.style.width = `${resizedButtonSize}px`;
        nextButton.style.height = `${resizedButtonSize}px`;

        //設定按鈕位置
        const buttonTop = resizedCanvasHeight - resizedButtonSize;
        prevButton.style.top = `${buttonTop}px`;
        prevButton.style.left = `${100 * scaleX}px`;

        const canvasWidth = document.getElementById("preview").width;

        nextButton.style.top = `${buttonTop}px`;
        nextButton.style.left = `${canvasWidth - (100 * scaleX) - resizedButtonSize}px`;
    }, [windowWidth])


    //換頁時重新繪畫
    useEffect(() => {

        draw();

        return () => {
            //未載入畫面前不可前往下一頁
            setis_button_disabled(true);
        }
    }, [page_number, book_page_content, resize]);

    const handleSetPage = (_page_number) => {

        setpage_number(_page_number)
        console.log("page",page_number)

        document.querySelectorAll("button.btn-prev")[0].style.display = "block"
        document.querySelectorAll("button.btn-next")[0].style.display = "block"

        if (_page_number === 0) {
            document.querySelectorAll("button.btn-prev")[0].style.display = "none"
            return
        }

        if (_page_number === total_page_number - 1) {
            document.querySelectorAll("button.btn-next")[0].style.display = "none"
            return
        }

    }


    return (
        <div className='container'>
            <canvas id="preview" width="2224" height="1668">
                無此內容!
            </canvas>
            <button className="btn-page btn-prev" disabled={is_button_disabled} onClick={() => handleSetPage(page_number - 1)}></button>
            <button className="btn-page btn-next" disabled={is_button_disabled} onClick={() => handleSetPage(page_number + 1)}></button>
        </div>
    );
}

export default Storyviewer;