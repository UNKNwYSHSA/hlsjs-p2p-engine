/**
 * Created by xieting on 2018/1/9.
 */

import EventEmitter from 'events';
import Events from './events';
import {defaultP2PConfig as config} from './config';
import debug from 'debug';

const log = debug('buffer-manager');

class BufferManager extends EventEmitter {
    constructor() {
        super();

        /* segment
        sn: number
        relurl: string
        data: Buffer
        size: number
         */
        this._segArray = [];             //最新的数据加在最左端
        this._currBufSize = 0;           //目前的buffer总大小
        this.urlSet = new Set();
    }

    get currBufSize() {
        return this._currBufSize;
    }

    addSeg(seg) {
        if (this.urlSet.has(seg.relurl)) return;                                  //防止重复加入seg
        log(`add seg ${seg.sn} url ${seg.relurl} size ${seg.data.byteLength}`);
        this._segArray.unshift(seg);
        this.urlSet.add(seg.relurl);
        this._currBufSize += seg.size;
        while (this._currBufSize > config.maxBufSize) {         //去掉多余的数据
            const lastSeg = this._segArray.pop();
            this._currBufSize -= lastSeg.size;
        }
    }

    getSegByURL(relurl) {
        for (let seg of this._segArray) {
            if (seg.relurl === relurl) {
                return seg;
            }
        }
        return null;
    }

    getSegBySN(sn) {
        for (let seg of this._segArray) {
            if (seg.sn === sn) {
                return seg;
            }
        }
        return null;
    }

    clear() {
        this._segArray = [];
        this._currBufSize = 0;
    }
}

export default BufferManager;