import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { drawBackgroundImage, drawText, drawAccessories, drawCharacter } from './../functions/draw';

function Storyviewer() {

    const { bookid } = useParams();
    const [total_page_number, settotal_page_number] = useState(0);
    const [All_book_content, setAll_book_content] = useState([]);
    const [page_number, setpage_number] = useState(Infinity);
    const [book_images, setbook_images] = useState([]);

    //取得所有的書籍內容
    useEffect(() => {
        fetch(`https://toysrbooks.com/dev/v0.1/getBookPage.php?book_id=${bookid}&token=eyJhbGciOiJIUzIEc9mz`)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                settotal_page_number(res.book_pages.length);
                draw(res.book_pages)
                setAll_book_content(res.book_pages);
            })
            .catch((err) => {
                console.log("error message:", err);
            })
    }, [])

    const resizeImage = () => {
        const image = document.querySelectorAll("img")[0];
        let scaleX
        let scaleY

        //取得使用者的視窗大小使Image等於視窗大小的0.9
        let resized_image_width = window.innerWidth * 0.9

        //透過比例算出照片適合高度
        let ratio = resized_image_width / 2224;
        let resized_image_height = 1668 * ratio

        if (resized_image_height > window.innerHeight) {
            resized_image_height = window.innerHeight
            ratio = resized_image_height / 1668
            resized_image_width = 2224 * ratio
        }


        //設定照片大小及縮放
        image.style.width = `${resized_image_width}px`;
        image.style.height = `${resized_image_height}px`;
        scaleX = resized_image_width / 2224
        scaleY = resized_image_height / 1668;


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
        const buttonTop = resized_image_height - resizedButtonSize;
        prevButton.style.top = `${buttonTop}px`;
        prevButton.style.left = `${100 * scaleX}px`;

        const imgWidth = document.querySelectorAll("img")[0].width;

        nextButton.style.top = `${buttonTop}px`;
        nextButton.style.left = `${imgWidth - (100 * scaleX) - resizedButtonSize}px`;

        const faceButton = document.getElementsByClassName("btn-face")[0];
        faceButton.style.left = `${100 * scaleX}px`;
        faceButton.style.top = `${100 * scaleY}px`;
    }

    //Execute when draw is over
    const finishedDraw = () => {
        const canvas = document.getElementById("preview")
        console.log(`%c Replace`, "color:red;font-size:25px")
        canvas?.replaceWith(new Image())
        resizeImage()
        handleSetPage(0);
        window.addEventListener("resize", debounce(() => {
            resizeImage()
        }));
    }

    //繪畫Function
    const draw = async (book_page_content) => {
        const canvas = document.getElementById("preview");
        const ctx = canvas.getContext("2d"); //取得Dom元素
        console.log(`%c Log`, "color:red;font-size:25px")
        setbook_images([])
        for (let i = 0; i < book_page_content.length; i++) {

            const currentContent = book_page_content[i];
            console.log("doDraw");
            console.log("currentContent", currentContent);

            ctx.clearRect(0, 0, canvas.innerWidth, canvas.innerHeight) //清空畫布

            await drawBackgroundImage(ctx, currentContent) //繪製底圖
            await drawAccessories(ctx, currentContent); //繪製配件
            await drawCharacter(ctx, currentContent); //繪製角色
            await drawText(ctx, currentContent); //繪製文字

            const image_url = canvas.toDataURL("image/jpeg", 1.0);
            setbook_images(book_images => [...book_images, image_url])

            if (i === book_page_content.length - 1) {
                finishedDraw()
            }
        }
    }


    //處理RWD
    const debounce = (func) => {
        let timer;
        return () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(func, 1000);
        };
    }

    //處理換頁
    useEffect(() => {
        if (page_number === Infinity) return
        const image = document.querySelectorAll("img")[0]
        image.src = book_images[page_number]
    }, [page_number])


    const handleSetPage = (_page_number) => {

        setpage_number(_page_number)
        console.log("page", page_number)

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

    const replaceCharacterToUser = () => {
        return new Promise((resolve, reject) => {
            fetch("https://toysrbooks.com/dev/v0.1/getUserRole.php?token=eyJhbGciOiJIUzIEc9mz")
                .then(res => {
                    return res.json()
                })
                .then(res => {
                    const all_book_content = [...All_book_content]
                    all_book_content.map(page_content => {
                        page_content.character.map((character, i) => {
                            const user_mood_photo = character.mood === 1 ? res.roles[i].face_photo_happy_url : res.roles[i].face_photo_sad_url
                            character.source_url = user_mood_photo
                            character.iscustom_face = true
                        })
                    })
                    resolve(all_book_content)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    const handleSetFace = async () => {
        const userface_book_content = await replaceCharacterToUser()
        const img = document.querySelectorAll("img")[0]
        console.log(`%c Replace`, "color:red;font-size:25px")
        const canvas = document.createElement('canvas')
        canvas.id = "preview"
        canvas.width = "2224"
        canvas.height = "1668"
        img.replaceWith(canvas)
        draw(userface_book_content)
    }


    return (
        <div className='container'>
            <canvas id="preview" width="2224" height="1668">
                無此內容!
            </canvas>
            <button className="btn-face" onClick={handleSetFace}>Original / Change</button>
            <button className="btn-page btn-prev" onClick={() => handleSetPage(page_number - 1)}></button>
            <button className="btn-page btn-next" onClick={() => handleSetPage(page_number + 1)}></button>
        </div>
    );
}

export default Storyviewer;