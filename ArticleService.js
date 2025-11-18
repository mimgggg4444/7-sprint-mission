
//====
//article api service
//====


const BASE_URL = 'https://panda-market-api-crud.vercel.app'; //

/**
*게시글 목록 조회
* @param {number}
* @param {number} //
* @param {string}
* @returns {Promise}

*/


export function getArticleList(page = 1, pageSize = 10, keyword = '') {
    //
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });

    //

    if (keyword) {
        params.append('keyword', keyword);
    }

    const url = `${BASE_URL}/articles?${params.toString()}`;

    return fetch(url)
        .then((response) => {

            //
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })

        .then((data) => {
            console.log(`게시글 조회 성공`);
            return data;
        })
        .catch((error) => {
            console.error(`게시글 목록 조회 실패:`, error.message);
            throw error;
        });
}


/**
 * 게시글 상세 조회
 * @param{number}
 * @returns{Promise}
 */

export function getArticle(articleId) {
    const url = `${BASE_URL}/articles/${articleId}`;

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log(`게시글 조회 성공 (id:${articleId})`);
            return data;
        })
        .catch((error) => {
            console.error(`게시글 조회 실패${articleId}:`, error.message);
            throw error;
        });
}


/**
 * 게시글 생성
 * @param{Object}
 *  * @param{string}
 *  * @param{string}
 *  * @param{string}
 *  * @returns{Promise}
 */


export function createArticle(articleData) {
    const url = `${BASE_URL}/articles`;


    const requestBody = {
        title: articleData.title,
        content: articleData.content,
        image: articleData.image || '',
    };

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);

            }
            return response.json();

        })

        .then((data) => {
            console.log('게시글 생성 성공');
            return data;
        })
        .catch((error) => {
            console.error('게시글 생성 실패', error.message);
            throw error;
        });
}


/**
 * 게시글 수정
 * @param{number}
 * @param{Object}
 * @returns{Promise}
 
 */

export function patchArticle(articleId, articleData) {
    const url = `${BASE_URL}/articles/${articleId}`;


    return fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
    })
        .then((response)=> {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then((data) => {
        console.log(`게식들 수정 성공 id: ${articleId}`);
        return data;
    })
    .catch((error)=>{
        console.error(`게시글 수정 실패 id: ${articleId}:`, error.message);
        throw error;
    });
}



/**
 * 
 * 게시글 삭제
 * @param{number}
 * @returns{Promise}
 */
export function deleteArticle(articleId){
    const url = `${BASE_URL}/articles/${articleId}`;


    return fetch(url, {
        method: 'DELETE',

    })
    .then((response)=> {
        if(!response.ok){
            throw new Error(`http error: ${response.status} - ${response.statusText}`);
        }
        //

        return response.status == 204? null : response.json();
    })
    .then(() =>{
        console.log(`게시글 삭제 성공 id: ${articleId}`);
        return{ success: true, articleId};
    })
    .catch((error) => {
        console.error(`게시글 삭제 실패 id: ${articleId}: `, error.message);
        throw error;
    });


}