import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { drawBackgroundImage, drawText, drawAccessories, drawCharacter, drawButtons } from './../functions/draw';

function Storyviewer() {

    const { bookid } = useParams();
    const [page, setpage] = useState(0);
    const [allcontent, setallcontent] = useState([]);
    const [prevButtonStyle, setprevButtonStyle] = useState();
    const [nextButtonStyle, setnextButtonStyle] = useState();
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

    //縮放畫布 及 設置按鈕位置及大小
    useEffect(() => {
        const canvas = document.getElementById("preview");
        const ctx = canvas.getContext("2d"); //取得Dom元素

        //將畫布比例縮小至1578 * 1080
        const scaleX = 0.7095323741;
        const scaleY = 0.64748201438;
        ctx.canvas.width = 1578;
        ctx.canvas.height = 1080;
        ctx.scale(scaleX, scaleY);

        //用以設置換頁按鈕位置
        const buttonHeight = document.getElementById("preview").height - 200;

        setprevButtonStyle({
            top: buttonHeight,
            left: 100 * scaleX,
        })

        const canvasWidth = document.getElementById("preview").width;
        const buttonSize = document.getElementsByClassName("btn-page")[0].clientWidth;

        setnextButtonStyle({
            top: buttonHeight,
            left: canvasWidth - (100 * scaleX) - buttonSize,
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
            await drawBackgroundImage(ctx, canvas, currentContent) //繪製底圖
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


    return (
        <div className='container'>
            <canvas id="preview" width="2224" height="1668">
            </canvas>
            <button className="btn-page btn-prev" style={prevButtonStyle} disabled={isButtonDisabled} onClick={() => setpage(prevPage => prevPage - 1)}></button>
            <button className="btn-page btn-next" style={nextButtonStyle} disabled={isButtonDisabled} onClick={() => setpage(prevPage => prevPage + 1)}></button>
        </div>
    );
}

export default Storyviewer;