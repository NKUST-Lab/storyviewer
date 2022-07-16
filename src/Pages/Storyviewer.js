import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { drawBackgroundImage, drawText, drawAccessories, drawCharacter } from './../functions/draw';
import useResize from './../Hooks/useResize';


function Storyviewer() {

    const { bookid } = useParams();
    const [page, setpage] = useState(0);
    const [allcontent, setallcontent] = useState([]);
    const [prevButtonStyle, setprevButtonStyle] = useState({});
    const [nextButtonStyle, setnextButtonStyle] = useState({});
    const [isButtonDisabled, setisButtonDisabled] = useState(false);

    //取得所有的書籍內容
    useEffect(() => {
        fetch(`https://toysrbooks.com/dev/v0.1/getBookPage.php?book_id=${bookid}&token=eyJhbGciOiJIUzIEc9mz`)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                console.log(res);
                setallcontent(res.book_pages);
            })
            .catch((err) => {
                console.log("error message:", err);
            })
    }, [])

    //換頁時更新顯示內容
    useEffect(() => {
        const currentContent = allcontent[page];
        console.log(currentContent);

        const canvas = document.getElementById("preview");
        const ctx = canvas.getContext("2d"); //取得Dom元素

        const draw = async () => {
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
        //開始繪畫
        draw();

        //比上方先執行
        return () => {
            ctx.clearRect(0, 0, 2224, 1668) //清空畫布
            setisButtonDisabled(true); //未載入畫面前不可前往下一頁
        }

    }, [page, allcontent]);

    //處理RWD
    useResize();

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