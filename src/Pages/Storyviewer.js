import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { drawBackgroundImage, drawText, drawAccessories, drawCharacter, drawButtons } from './../functions/draw';

function Storyviewer() {

    const { bookid } = useParams();
    const [page, setpage] = useState(0);
    const [allcontent, setallcontent] = useState([]);

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
        ctx.clearRect(0, 0, 2224, 1668) //清空畫布

        const draw = async () => {
            //防止還未取得資料時執行
            if (!currentContent) {
                return
            }
            await drawBackgroundImage(ctx, canvas, currentContent) //繪製底圖
            await drawAccessories(ctx, currentContent); //繪製配件
            await drawCharacter(ctx, currentContent); //繪製角色
            drawText(ctx, currentContent); //繪製文字
        }
        draw();
    }, [page, allcontent]);

    return (
        <>
            <canvas id="preview" width="2224" height="1668">
            </canvas>
            <button className="btn-page btn-prev" onClick={() => setpage(prevPage => prevPage - 1)}></button>
            <button className="btn-page btn-next" onClick={() => setpage(prevPage => prevPage + 1)}></button>
        </>
    );
}

export default Storyviewer;