// Testing commit
//繪製底圖
export function drawBackgroundImage(ctx, data) {
    const img = new Image();
    img.src = data.page_photo_url;
    img.crossOrigin = "anonymous" //設定後才能轉成圖片
    return (
        new Promise((resolve) => {
            img.addEventListener("load", () => {
                ctx.drawImage(img, 0, 0, img.width, img.height);
                resolve();
            })
            img.onerror = () => {
                console.warn("background image load failed")
            }
        })
    )
}

//繪製文字
let text_alignment = 'left'
let fontStyle = ''
export function drawText(ctx, data, isCustomFace) {
    if (data.text == undefined) return
    return Promise.all(
        data.text.map(text => {
            const rictWidth = parseInt(text.rect.split(",")[0]);
            const rictHeight = parseInt(text.rect.split(",")[1]);
            const locationX = parseInt(text.location.split(",")[0]);
            const locationY = parseInt(text.location.split(",")[1]);
            const text_context = text.book_text;
            //設置字型及大小
            fontStyle = fontStyleDetectOS(text.text_size)
            ctx.font = fontStyle
            ctx.fillStyle = text.text_color;
            //設置陰影
            if (text.shadow !== 0) {
                ctx.shadowColor = text.shadow_color;
                ctx.shadowOffsetX = text.shadow;
                ctx.shadowOffsetY = text.shadow;
            }
            //設定對齊
            let re_positionedX = locationX
            switch (text.alignment) {
                case 0:
                    ctx.textAlign = 'center'
                    text_alignment = 'center'
                    re_positionedX = locationX
                    break;
                case 1:
                    // ctx.textAlign = 'left'
                    text_alignment = 'left'
                    re_positionedX = locationX
                    break;
                case 2:
                    // ctx.textAlign = 'right'
                    text_alignment = 'right'
                    re_positionedX = locationX + rictWidth
                    break;
            }
            ctx.textAlign = 'left'
            //設定旋轉
            ctx.save();
            if (text.rotate !== 0) ctx.rotate(text.rotate * Math.PI / 180);
            wrapText(ctx, text_context, re_positionedX, locationY + text.text_size * 1.16, rictWidth, text.text_size * 1.16, data.book_characters, isCustomFace);
            if (text.rotate !== 0) ctx.restore()
            // ctx.fillText(text_context, locationX, locationY, rictWidth);
        })
    )

}

//繪製角色
export async function drawCharacter(ctx, data, isCustomFace) {
    if (data.character == undefined) return
    console.log("Doing draw iscustomface is ", isCustomFace)
    return Promise.all(
        data.character.map(async (character) => {
            await drawThings(ctx, character.source_url, isCustomFace ? character.size : 100, isCustomFace ? character.location : character.source_location, isCustomFace ? character.rotate : 0, isCustomFace);
        })
    )
}

//繪製配件
export async function drawAccessories(ctx, data) {
    if (data.accessories == undefined) return
    return Promise.all(
        data.accessories.map(async (accessory) => {
            await drawThings(ctx, accessory.accessory_url, accessory.size, accessory.location, accessory.rotate, true);
        })
    )
}

//圖形繪製
function drawThings(ctx, src, size, location, rotate, isCustomface = false) {
    const img = new Image();
    img.src = src; //設定URL
    img.crossOrigin = "anonymous" //設定後才能轉成圖片
    const percentagesize = size / 100; //設定Size
    const locationX = parseInt(location.split(",")[0]); //設定X位置
    const locationY = parseInt(location.split(",")[1]); //設定Y位置
    return (
        new Promise((resolve) => {
            img.addEventListener("load", () => {
                const resizeWidth = img.width * percentagesize;
                const resizeHeight = img.height * percentagesize;
                ctx.save();
                //設定旋轉
                if (rotate !== 0) ctx.translate(locationX, locationY);
                if (rotate !== 0) ctx.rotate(rotate * Math.PI / 180);
                ctx.drawImage(img, (rotate !== 0 && isCustomface) ? -resizeWidth / 2 : locationX - resizeWidth / 2, (rotate !== 0 && isCustomface) ? -resizeHeight / 2 : locationY - resizeHeight / 2, resizeWidth, resizeHeight);
                ctx.restore()
                resolve();
            })
            img.onerror = () => {
                console.warn(`draw things error occured`);
                resolve();
            }
        })
    )
}

//會自動換行的fillText
const wrapText = (ctx, text, x, y, maxWidth, lineHeight, book_characters, isCustomFace) => {
    //遇到分行符號換行
    for (const words of text.trim().split('\n')) {
        let line = '';
        for (let [index, w] of words.split(' ').entries()) {
            w = replaceCharacterText(w, book_characters, isCustomFace)
            const testLine = line + w + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && index > 0) {
                printLine(ctx, x, y, line, maxWidth)
                line = w + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        printLine(ctx, x, y, line, maxWidth, false)
        y += lineHeight
    }
}

const printLine = (ctx, x, y, line, maxWidth, is_full_line = true) => {
    let prevwidth = x
    //為向右對齊時用不同方式畫
    if (text_alignment === 'right') {
        const reversed_line = line.split(' ').reverse()
        for (let word of reversed_line) {
            //粗體設定
            word = makeFontBold(ctx , word , fontStyle)
            prevwidth -= ctx.measureText(' ' + word).width
            ctx.fillText(word, prevwidth, y);
        }
        return
    }

    //向中對齊且為最後一行
    if (!is_full_line && text_alignment === 'center') {
        const lineWidth = ctx.measureText(line).width
        prevwidth = x + (maxWidth - lineWidth) / 2
        for (let word of line.split(' ')) {
            //粗體設定
            word = makeFontBold(ctx , word , fontStyle)
            ctx.fillText(word, prevwidth, y);
            prevwidth += ctx.measureText(word + ' ').width
        }
        return
    }

    //確定line裡的字總寬度會達到maxWidth時 把每個字各自fillText 才可以套用格式
    for (let word of line.split(' ')) {
        //粗體設定
        word = makeFontBold(ctx , word , fontStyle)
        ctx.fillText(word, prevwidth, y);
        prevwidth += ctx.measureText(word + ' ').width
    }
}

const makeFontBold = (ctx , word , fontStyle) => {
    //粗體設定
    ctx.font = fontStyle
    if (word.includes("##")) {
        ctx.font = `bold ${fontStyle}`
        word = word.replaceAll('##', '')
    }
    return word
}

const replaceCharacterText = (w, book_characters, isCustomFace) => {
    //改變文字內容 且 為換臉模式
    if (w.includes('@') && isCustomFace) {
        const clean_word = w.match(/(?<target>@\d+(he_she|him_her|his_her|his_her|himself_herself|He_She|Him_Her|His_Her|His_Hers|Himself_Herself|boy_girl|man_woman|Boy_Girl|Man_Woman|))/)[1]
        const rolenumber = parseInt(clean_word.match(/@(?<target>\d*)[\S\s]*/)[1])

        // @1 or @2 -> 客戶名稱
        if (/^@\d$/.test(clean_word)) {
            for (const char of book_characters) {
                if (char.character_number === rolenumber) {
                    return w.replace(/@\d+/, `##${char.role_name}##`)
                }
            }
        }

        // @1he_she or @1him_her or @1his_her -> 客戶主詞 受詞 所有 根據客戶性別role_gender 
        if (/^@\d+(he_she|him_her|his_her|his_her|himself_herself|He_She|Him_Her|His_Her|His_Hers|Himself_Herself|boy_girl|man_woman|Boy_Girl|Man_Woman)$/.test(clean_word)) {
            for (const char of book_characters) {
                if (char.character_number === rolenumber) {
                    const replace_word = char.role_gender === "M" ? clean_word.match(/^@\d*(?<target>\S*)_(?<target2>\S*)/)[1] : clean_word.match(/^@\d*(?<target>\S*)_(?<target2>\S*)/)[2]
                    return w.replace(/@\d+(he_she|him_her|his_her|his_her|himself_herself|He_She|Him_Her|His_Her|His_Hers|Himself_Herself|boy_girl|man_woman|Boy_Girl|Man_Woman)/, replace_word)
                }
            }
        }
    }

    //改變文字內容 且 非換臉模式
    if (w.includes('@') && !isCustomFace) {
        const clean_word = w.match(/(?<target>@\d+(he_she|him_her|his_her|his_her|himself_herself|He_She|Him_Her|His_Her|His_Hers|Himself_Herself|boy_girl|man_woman|Boy_Girl|Man_Woman|))/)[1]
        const rolenumber = parseInt(clean_word.match(/@(?<target>\d*)[\S\s]*/)[1])

        // @1 or @2 -> 角色名稱
        if (/^@\d$/.test(clean_word)) {
            for (const char of book_characters) {
                if (char.character_number === rolenumber) {
                    return w.replace(/@\d+/, char.character_name)
                }
            }
        }

        // @1he_she or @1him_her or @1his_her -> 角色主詞 受詞 所有 根據角色性別character_gender
        if (/^@\d+(he_she|him_her|his_her|his_her|himself_herself|He_She|Him_Her|His_Her|His_Hers|Himself_Herself|boy_girl|man_woman|Boy_Girl|Man_Woman)$/.test(clean_word)) {
            for (const char of book_characters) {
                if (char.character_number === rolenumber) {
                    const replace_word = char.gender === "male" ? clean_word.match(/^@\d*(?<target>\S*)_(?<target2>\S*)/)[1] : clean_word.match(/^@\d*(?<target>\S*)_(?<target2>\S*)/)[2]
                    return w.replace(/@\d+(he_she|him_her|his_her|his_her|himself_herself|He_She|Him_Her|His_Her|His_Hers|Himself_Herself|boy_girl|man_woman|Boy_Girl|Man_Woman)/, replace_word)
                }
            }
        }
    }

    return w
}

const fontStyleDetectOS = (text_size) => {
    const platform = navigator.platform
    //Mac
    if (platform.indexOf("Mac") > -1) {
        return `${text_size}px ChalkboardSE-Light`
    }
    //Windows
    if (platform.indexOf("Win") > -1) {
        return `${text_size}px Chalkboard SE Light`
    }

    //預設字體
    return `${text_size}px Chalkboard SE Light`
}
