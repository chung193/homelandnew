'use client';

import {useEffect,useRef,useState} from 'react';
import {Text} from '@astryxdesign/core/Text';

export default function PropertyViewCount({propertyId,initialViews}:{propertyId:string;initialViews:number}) {
    const [views,setViews]=useState(initialViews);
    const recorded=useRef(false);

    useEffect(()=>{
        if(recorded.current)return;
        recorded.current=true;
        void fetch(`/api/properties/${propertyId}/view`,{method:'POST'})
            .then(response=>response.ok?response.json():null)
            .then(result=>{if(typeof result?.data?.views==='number')setViews(result.data.views)})
            .catch(()=>undefined);
    },[propertyId]);

    return <Text type="supporting">👁 {views.toLocaleString('vi-VN')} lượt xem</Text>;
}
