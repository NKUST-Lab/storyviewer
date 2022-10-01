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
    const [isCustomFace, setisCustomFace] = useState(false);
    const [completeness, setcompleteness] = useState(0);
    const [canvas_width, setcanvas_width] = useState(2224);
    const [canvas_height, setcanvas_height] = useState(1668);

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

    //用來取得角色的詳細資料
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
    //當繪畫完畢時執行
    useEffect(() => {
        if (book_images.length === 0) return
        finishedDraw()
    }, [book_images])

    //當第一次繪畫完畢時執行
    useEffect(() => {
        if (!All_book_content) return
        draw(All_book_content)
    }, [All_book_content])

    //用來調整繪畫完後照片及其內物件的大小及位置
    const resizeImage = () => {
        const image = document.querySelector("img");
        if (!image) return
        let scaleX
        let scaleY

        //先將畫布的高與畫面高同高 然後在根據比例設定寬度
        let resized_image_height = window.innerHeight
        let ratio = resized_image_height / canvas_height
        let resized_image_width = canvas_width * ratio

        //設定照片大小及縮放
        image.style.width = `${resized_image_width}px`;
        image.style.height = `${resized_image_height}px`;
        scaleX = resized_image_width / canvas_width
        scaleY = resized_image_height / canvas_height;


        const prevButton = document.querySelector(".btn-prev")
        const nextButton = document.querySelector(".btn-next")
        const faceButton = document.querySelector('.btn-face');
        //按鈕大小等於畫布高度 / 4
        const resizedButtonSize = resized_image_height / 4
        prevButton.style.width = `${resizedButtonSize}px`;
        prevButton.style.height = `${resizedButtonSize}px`;
        nextButton.style.width = `${resizedButtonSize}px`;
        nextButton.style.height = `${resizedButtonSize}px`;
        faceButton.style.width = `${resizedButtonSize / 2}px`;
        faceButton.style.height = `${resizedButtonSize / 2}px`;

        //設定按鈕位置
        const imageX = image.offsetLeft
        const buttonTop = resized_image_height - resizedButtonSize;
        prevButton.style.top = `${buttonTop}px`;
        prevButton.style.left = `${100 * scaleX + imageX}px`;

        nextButton.style.top = `${buttonTop}px`;
        nextButton.style.left = `${image.width - (100 * scaleX) - resizedButtonSize + imageX}px`;
        
        faceButton.style.left = `${100 * scaleX + imageX}px`;
        faceButton.style.top = `${100 * scaleY}px`;

        //設定頁碼位置
        const page_element = document.getElementById('page-number')
        const font_size = resizedButtonSize / 4
        page_element.style.fontSize = `${font_size}px`
        page_element.style.top = `${resized_image_height - resizedButtonSize * 3 / 5}px`
        page_element.style.left = `${image.width - font_size * 2 + imageX}px`
    }

    //Execute when draw is over
    const finishedDraw = () => {
        const container = document.querySelector(".container")
        container.insertBefore(new Image(),container.children[2])
        resizeImage()
        //第一次繪畫後的初始化設定
        if (page_number === Infinity) {
            //設定該繪本的最大頁數及最小頁數
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
            //繪畫結束後新增resize的event listener
            window.addEventListener("resize", debounce(() => {
                resizeImage()
            }));
            handleSetPage(temp_min_page_number ,true);
        } else {
            handleSetPage(page_number);
        }
    }

    //繪畫Function
    const draw = async (book_page_content) => {
        setbook_images([])
        let temp_book_image = []
        setcompleteness(0)
        const eachcompleteness = 100 / book_page_content.length
        book_page_content.forEach(async (currentContent) => {
            const canvas = document.createElement('canvas')
            canvas.style.width = '2224px'
            canvas.style.height = '1668px'
            canvas.setAttribute('width', 2224)
            canvas.setAttribute('height', 1668)
            const ctx = canvas.getContext("2d");

            console.log("doDraw");
            console.log("currentContent", currentContent);

            ctx.clearRect(0, 0, canvas.innerWidth, canvas.innerHeight) //清空畫布

            await drawBackgroundImage(ctx, currentContent) //繪製底圖
            await drawCharacter(ctx, currentContent, isCustomFace); //繪製角色
            if (isCustomFace) await drawAccessories(ctx, currentContent); //繪製配件
            await drawText(ctx, currentContent, isCustomFace); //繪製文字

            const image_url = canvas.toDataURL("image/jpeg", 1.0);
            temp_book_image = [...temp_book_image, { imagesrc: image_url, page_number: currentContent.book_page }]
            setcompleteness(prevcompleteness => prevcompleteness + eachcompleteness)

            if (temp_book_image.length === book_page_content.length) {
                setbook_images(temp_book_image)
            }
        });
    }


    //用來處理RWD
    const debounce = (func) => {
        let timer;
        return () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(func, 1000);
        };
    }

    //換頁時根據頁數選出同頁數的照片
    const showImageOnScreen = (_page_number) => {
        const image_element = document.querySelector("img")
        image_element.src = book_images.find(image => image.page_number === _page_number).imagesrc
    }

    //處理換頁
    const handleSetPage = (_page_number , firstender = false) => {

        setpage_number(_page_number)
        showImageOnScreen(_page_number)
        document.getElementById('page-number').innerText = _page_number

        document.querySelector("button.btn-prev").style.display = "block"
        document.querySelector("button.btn-next").style.display = "block"

        if (_page_number === min_page_number || firstender) {
            document.querySelector("button.btn-prev").style.display = "none"
            return
        }

        if (_page_number === max_page_number) {
            document.querySelector("button.btn-next").style.display = "none"
            return
        }

    }

    //處理Loading畫面
    useEffect(() => {
        const loadingscreen = document.querySelector(".loadingscreen")
        if (completeness >= 100) {
            loadingscreen.style.display = "none"
            return
        }
        loadingscreen.style.display = "flex"
    }, [completeness])


    //取得使用者的臉 並且回傳一個改完face的book content
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


    //按下換臉按鈕時觸發
    useEffect(() => {

        if (completeness < 100) return
        
        const handleSetFace = async () => {
            document.querySelector("img").remove()
            const customface_book_content = await replaceCharacterToUser([...All_book_content])
            console.log(customface_book_content)
            draw(isCustomFace ? customface_book_content : All_book_content)
        }
        handleSetFace()

    }, [isCustomFace])



    return (
        <div className='container'>
            <div className='loadingscreen'>
                <span>Loading... {Math.floor(completeness)}%</span>
            </div>
            <button className="btn-face" onClick={() => setisCustomFace(!isCustomFace)}>
                <span>Original / Change</span>
            </button>
            <button className="btn-page btn-prev" onClick={() => handleSetPage(page_number - 1)}></button>
            <button className="btn-page btn-next" onClick={() => handleSetPage(page_number + 1)}></button>
            <p id='page-number'></p>
        </div>
    );
}

export default Storyviewer;