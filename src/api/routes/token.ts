import _ from 'lodash';

import Request from '@/lib/request/Request.ts';
import {getCredit, getTokenLiveStatus, receiveCredit, tokenSplit} from '@/api/controllers/core.ts';

export default {

    prefix: '/token',

    post: {

        '/check': async (request: Request) => {
            request
                .validate('body.token', _.isString)
            const live = await getTokenLiveStatus(request.body.token);
            return {
                live
            }
        },

        '/points': async (request: Request) => {
            request
                .validate('headers.authorization', _.isString)
            // refresh_token切分
            const tokens = tokenSplit(request.headers.authorization);
            return await Promise.all(tokens.map(async (token) => {
                const points = await getCredit(token);
                if (points.totalCredit == 0) {
                    await receiveCredit(token);
                }
                return {
                    token,
                    points: await getCredit(token)
                }
            }));
        }

    }

}