import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { drawBackgroundImage, drawText, drawAccessories, drawCharacter } from './../functions/draw';

function Storyviewer() {

    const { bookid } = useParams();
    const [All_book_content, setAll_book_content] = useState([]);
    const [page_number, setpage_number] = useState(Infinity);
    const [book_images, setbook_images] = useState([]);
    const [min_page_number, setmin_page_number] = useState(Infinity);
    const [max_page_number, setmax_page_number] = useState(0);
    const [isCustomFace, setisCustomFace] = useState(false)

    //取得所有的書籍內容
    useEffect(() => {
        fetch(`https://toysrbooks.com/dev/v0.1/getBookPage.php?book_id=${bookid}&token=eyJhbGciOiJIUzIEc9mz`)
            .then((res) => {
                return res.json();
            })
            .then(async (res) => {
                const allbook_content_character_detailed = await fetchCharacterDetail(res.book_pages)
                console.log(allbook_content_character_detailed)
                setAll_book_content(allbook_content_character_detailed);
            })
            .catch((err) => {
                console.log("error message:", err);
            })
    }, [])

    const fetchCharacterDetail = async (all_book_pages) => {
        return fetch(`https://toysrbooks.com/dev/v0.1/getBookCharacter.php?book_id=${bookid}&token=eyJhbGciOiJIUzIEc9mz`)
            .then(res => {
                return res.json();
            })
            .then(res => {
                const newAll_book_pages = all_book_pages.map(page_content => {
                    return { ...page_content, book_characters: res.book_characters }
                })
                return newAll_book_pages
            })
    }

    useEffect(() => {
        if (book_images.length === 0) return
        finishedDraw()
    }, [book_images])


    useEffect(() => {
        if (!All_book_content) return
        draw(All_book_content)
    }, [All_book_content])

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

        const img_element = document.querySelectorAll("img")[0]

        nextButton.style.top = `${buttonTop}px`;
        nextButton.style.left = `${img_element.width - (100 * scaleX) - resizedButtonSize}px`;

        const faceButton = document.getElementsByClassName("btn-face")[0];
        faceButton.style.left = `${100 * scaleX}px`;
        faceButton.style.top = `${100 * scaleY}px`;

        //設定頁碼位置
        const page_element = document.getElementById('page-number')
        const font_size = resizedButtonSize / 4
        page_element.style.fontSize = `${font_size}px`
        page_element.style.top = `${resized_image_height - resizedButtonSize *3/5}px`
        page_element.style.left = `${img_element.width - font_size * 2}px`
    }

    //Execute when draw is over
    const finishedDraw = () => {
        const canvas = document.getElementById("preview")
        console.log(`%c finished draw replace canvas to img`, "color:red;font-size:25px")
        canvas?.replaceWith(new Image())
        resizeImage()
        if (page_number === Infinity) {
            let temp_max_page_number = 0
            let temp_min_page_number = Infinity
            for (const image of book_images) {
                if (image.page_number < temp_min_page_number) {
                    temp_min_page_number = image.page_number
                }
                if (image.page_number > temp_max_page_number) {
                    temp_max_page_number = image.page_number
                }
            }
            setmax_page_number(temp_max_page_number)
            setmin_page_number(temp_min_page_number)
            handleSetPage(temp_min_page_number);
        } else {
            handleSetPage(page_number);
        }
        window.addEventListener("resize", debounce(() => {
            resizeImage()
        }));
    }

    //繪畫Function
    const draw = async (book_page_content) => {
        setbook_images([])
        let temp_book_image = []
        book_page_content.forEach(async (currentContent) => {
            const canvas = document.createElement('canvas')
            canvas.style.width = '2224px'
            canvas.style.height = '1668px'
            canvas.setAttribute('width', 2224)
            canvas.setAttribute('height', 1668)
            document.body.appendChild(canvas)
            const ctx = canvas.getContext("2d"); //取得Dom元素

            console.log("doDraw");
            console.log("currentContent", currentContent);

            ctx.clearRect(0, 0, canvas.innerWidth, canvas.innerHeight) //清空畫布

            await drawBackgroundImage(ctx, currentContent) //繪製底圖
            await drawCharacter(ctx, currentContent, isCustomFace); //繪製角色
            if (isCustomFace) await drawAccessories(ctx, currentContent); //繪製配件
            await drawText(ctx, currentContent, isCustomFace); //繪製文字

            const image_url = canvas.toDataURL("image/jpeg", 1.0);
            temp_book_image = [...temp_book_image, { imagesrc: image_url, page_number: currentContent.book_page }]
            canvas.remove()

            if (temp_book_image.length === book_page_content.length) {
                setbook_images(temp_book_image)
            }
        });
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
    const showImageOnScreen = (_page_number) => {
        const image_element = document.querySelectorAll("img")[0]
        image_element.src = book_images.find(image => image.page_number === _page_number).imagesrc
    }

    //處理換頁
    const handleSetPage = (_page_number) => {

        setpage_number(_page_number)
        showImageOnScreen(_page_number)
        document.getElementById('page-number').innerText = _page_number
        console.log("page", _page_number)

        document.querySelectorAll("button.btn-prev")[0].style.display = "block"
        document.querySelectorAll("button.btn-next")[0].style.display = "block"

        if (_page_number === min_page_number) {
            document.querySelectorAll("button.btn-prev")[0].style.display = "none"
            return
        }

        if (_page_number === max_page_number) {
            document.querySelectorAll("button.btn-next")[0].style.display = "none"
            return
        }

    }

    //docs123
    const replaceCharacterToUser = async (all_book_content) => {
        return fetch("https://toysrbooks.com/dev/v0.1/getUserRole.php?token=eyJhbGciOiJIUzIEc9mz")
            .then(res => {
                return res.json()
            })
            .then(res => {
                const customface_all_book_content = all_book_content.map(page_content => {
                    const replaced_page_content = page_content.character.map((character, i) => ({
                        ...character,
                        source_url: character.mood === 1 ? res.roles[i].face_photo_happy_url : res.roles[i].face_photo_sad_url
                    }))
                    const replaced_book_characters = page_content.book_characters.map((book_character, i) => {
                        return {
                            ...book_character,
                            role_number: res.roles[i].role_number,
                            role_name: res.roles[i].role_name,
                            role_gender: res.roles[i].role_gender,
                        }
                    })
                    return { ...page_content, character: replaced_page_content, book_characters: replaced_book_characters }
                })
                return customface_all_book_content
            })
            .catch(err => {
                console.warn(err)
            })

    }



    useEffect(() => {

        const handleSetFace = async () => {
            const img = document.querySelectorAll("img")[0]
            console.log(`%c handleSetFace`, "color:red;font-size:25px")
            const canvas = document.createElement('canvas')
            canvas.id = "preview"
            canvas.width = "2224"
            canvas.height = "1668"
            img.replaceWith(canvas)

            const customface_book_content = await replaceCharacterToUser([...All_book_content])
            console.log(customface_book_content)
            draw(isCustomFace ? customface_book_content : All_book_content)
        }
        handleSetFace()

    }, [isCustomFace])



    return (
        <div className='container'>
            <canvas id="preview" width="2224" height="1668">
                無此內容!
            </canvas>
            <button className="btn-face" onClick={() => setisCustomFace(!isCustomFace)}>Original / Change</button>
            <button className="btn-page btn-prev" onClick={() => handleSetPage(page_number - 1)}></button>
            <button className="btn-page btn-next" onClick={() => handleSetPage(page_number + 1)}></button>
            <p id='page-number'></p>
        </div>
    );
}

export default Storyviewer;