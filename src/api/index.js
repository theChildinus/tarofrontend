import request from '../utils/request';

export const fetchData = (query) => {
    return request({
        url: '/usertable',
        method: 'post',
        data: query
    })
}