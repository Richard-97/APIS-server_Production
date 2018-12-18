const express = require("express");
const cors = require('cors');
const axios = require('axios');
const pg = require('pg');
const knex = require('knex');

pg.defaults.ssl = true;

const bodyParser = require('body-parser');

const app = express();

const db = knex({
    client: 'pg',
    version: '9.6',
    connection: {
    host : 'apispostgresql.postgres.database.azure.com',
    user : 'is200it@apispostgresql',
    password : 'Is12342580',
    database : 'postgres'
  }
});

app.use(cors());
app.use(bodyParser.json());


const state1 = async (db, id, count)=>{
    console.log('1')
    const stop = await db('stopProduction').where('id', '=', 1);
    console.log(stop)
    const order = await db('orders').where('id', '=', id)
    if(order[0].status === 'Začiatok výroby'){
        if(stop[0].stop !== 1){
            await setTimeout( async () => {
                const updateStatus = await db('orders').where('id', '=', id).update('status', 'Výroba rámu')
                if(updateStatus === 1){
                    state2(db, id, count)
                }
            }, count*10000);
        } 
    }
    else{
        state2(db, id, count)
    }
}
const state2 = async (db, id, count)=>{
    console.log('2')
    const stop = await db('stopProduction').where('id', '=', 1);
    const order = await db('orders').where('id', '=', id)
    if(order[0].status === 'Výroba rámu'){
        if(stop[0].stop !== 1){
            await setTimeout( async () => {
                const updateStatus = await db('orders').where('id', '=', id).update('status', 'Nasadenie výpletu')
                if(updateStatus === 1){
                    state3(db, id, count)
                }
            }, count*10000);
        } 
    }
    else{
        state3(db, id, count)
    }
}
const state3 = async (db, id, count)=>{
    console.log('3')
    const stop = await db('stopProduction').where('id', '=', 1);
    const order = await db('orders').where('id', '=', id)
    if(order[0].status === 'Nasadenie výpletu'){
        if(stop[0].stop !== 1){
            setTimeout( async () => {
                const updateStatus = await db('orders').where('id', '=', id).update('status', 'Nasadenie gripu')
                if(updateStatus === 1){
                    state4(db, id, count)
                }
            }, count*10000);
        } 
    }
    else{
        state4(db, id, count)
    }
    
}
const state4 = async (db,id,count)=>{
    console.log('4')
    const stop = await db('stopProduction').where('id', '=', 1);
    const order = await db('orders').where('id', '=', id)
    if(order[0].status === 'Nasadenie gripu'){
        if(stop[0].stop !== 1){
            setTimeout( async () => {
                const updateState = await db('orders').where('id', '=', id).update('status', 'Koniec výroby')
                if(updateState === 1){
                    state5(db, id, count)
                }
            }, count*10000);
        } 
    }
    else{
        state5(db, id, count)
    }
}
const state5 = async (db,id, count)=>{
    console.log('5')
    const stop = await db('stopProduction').where('id', '=', 1);
    const order = await db('orders').where('id', '=', id)
    if(order[0].status === 'Koniec výroby' || order[0].status === 'Testovanie kvality'){
        if(stop[0].stop !== 1){
            setTimeout( async () => {
                const updateState = await db('orders').where('id', '=', id).update('status', 'Testovanie kvality')
                if(updateState === 1 ){
                    console.log('**********TEST KVALITY***************')
                    if(true){//**KONTROLA KVALITY ***************************************/

                                         if(order[0].name.includes('Type-')){
                                             console.log('name', order[0].name)
                                             const racket = await db('racketOnWarehouse').where('racketName', '=', order[0].name)
                                             let frame = racket[0].frameType
                                             let grip = racket[0].gripType
                                             let head = racket[0].headType


                                    
                                             const racketFrame = await db('racketFrame').where('technology', '=', frame);
                                             const racketGrip = await db('racketGrip').where('type', '=', grip);
                                             const racketHead = await db('racketHeadSize').where('type', '=', head);
                                    
                                    
                                             const racketObjFrame = racketFrame[0];
                                                 delete racketObjFrame["ID_frame"];
                                                 delete racketObjFrame["price"];
                                                 delete racketObjFrame["technology"];
                                             const racketObjGrip = racketGrip[0];
                                                 delete racketObjGrip["ID_grip"]
                                                 delete racketObjGrip["price"]
                                                 delete racketObjGrip["type"]
                                             const racketObjHead = racketHead[0];
                                                 delete racketObjHead["ID_head"]
                                                 delete racketObjHead["price"]
                                                 delete racketObjHead["type"]
                                    
                                    
                                             let weight_frame = 0;
                                             let weight_grip = 0;
                                             let weight_head = 0;
                                             for(var i in racketObjFrame){
                                                 if(racketObjFrame[i] !== 0){
                                                     const racketMaterial = await db('racketMaterial').where('type', '=', i);
                                                     weight_frame = weight_frame + (racketObjFrame[i]*racketMaterial[0].weight)
                                                     console.log('frame:',weight_frame)
                                                 }
                                             }
                                             for(var j in racketObjGrip){
                                                 if(racketObjGrip[j] !== 0){
                                                     const racketMaterial = await db('racketMaterial').where('type', '=', j);
                                                     weight_grip = weight_grip + (racketObjGrip[j]*racketMaterial[0].weight)
                                                     console.log('grip:',weight_grip)
                                                 }
                                             }
                                    
                                             for(var j in racketObjHead){
                                                 if(racketObjHead[j] !== 0){
                                                     const racketMaterial = await db('racketMaterial').where('type', '=', j);
                                                     weight_head = weight_head + (racketObjHead[j]*racketMaterial[0].weight)
                                                     console.log('head:',weight_head)
                                                 }
                                             }

                                             let randomtechnology =Math.floor(Math.random() * 6) + 1 ;
                                             if(randomtechnology === 2){
                                                console.log('prvy test:', randomtechnology)
                                                db('orders').where('id', '=', id).update('status', 'Raketa neprešla testom kvality-Použitý zlý materiál').then('db was updated')
                                             }
                                             else{
                                                 console.log('prvy test',randomtechnology)
                                                        let final_weight = weight_frame + weight_grip + weight_head;
                                                        let real_weight = 0;
                                        
                                                        console.log('final:',final_weight)
                                                        let randomValue =Math.floor(Math.random() * 6) + 1 ;
                                                        //ZMENA VAHY
                                                        if(randomValue === 2){
                                                            real_weight = 1.15*final_weight;
                                                            console.log('Padla 4 -> zla vyroba')
                                                        }
                                                        else{
                                                            real_weight = final_weight;
                                                            console.log('nepadla 4 -> padla', randomValue)
                                                        }
                                                        console.log('random:', real_weight)
                                                        if(final_weight === real_weight){
                                                            db('stopProduction').where('id', '=', 1)
                                                            .then((data)=>{
                                                                if(data[0].stop !== 1){
                                                                    db('orders').where('id', '=', id).update('status', 'Objednávka odoslaná').then('db was updated')
        
                                                                }
                                                            })
                                                        }
                                                        else{
                                                            db('stopProduction').where('id', '=', 1)
                                                            .then((data)=>{
                                                                if(data[0].stop !== 1){
                                                                    db('orders').where('id', '=', id).update('status', 'Raketa neprešla testom kvality-Nesedí váha').then('db was updated')
                                                                }
                                                            })
                                                        }
                                                    }
                                         }
                                         else{
                                            const racket_num = await  order[0].name.split('-')
                                            const own_racket = await db('ownRacket').where('order_id', '=', racket_num[1]);
                                            console.log('name', order[0].name)
                                                    let frame = own_racket[0].racketFrame
                                                    let grip = own_racket[0].racketGrip
                                                    let head = own_racket[0].racketHead
                                            
                                                    const racketFrame = await db('racketFrame').where('technology', '=', frame);
                                                    const racketGrip = await db('racketGrip').where('type', '=', grip);
                                                    const racketHead = await db('racketHeadSize').where('type', '=', head);
                                            
                                            
                                                    const racketObjFrame = racketFrame[0];
                                                        delete racketObjFrame["ID_frame"];
                                                        delete racketObjFrame["price"];
                                                        delete racketObjFrame["technology"];
                                                    const racketObjGrip = racketGrip[0];
                                                        delete racketObjGrip["ID_grip"]
                                                        delete racketObjGrip["price"]
                                                        delete racketObjGrip["type"]
                                                    const racketObjHead = racketHead[0];
                                                        delete racketObjHead["ID_head"]
                                                        delete racketObjHead["price"]
                                                        delete racketObjHead["type"]
                                            
                                            
                                                    let weight_frame = 0;
                                                    let weight_grip = 0;
                                                    let weight_head = 0;
                                                    for(var i in racketObjFrame){
                                                        if(racketObjFrame[i] !== 0){
                                                            const racketMaterial = await db('racketMaterial').where('type', '=', i);
                                                            weight_frame = weight_frame + (racketObjFrame[i]*racketMaterial[0].weight)
                                                            console.log('frame:',weight_frame)
                                                        }
                                                    }
                                                    for(var j in racketObjGrip){
                                                        if(racketObjGrip[j] !== 0){
                                                            const racketMaterial = await db('racketMaterial').where('type', '=', j);
                                                            weight_grip = weight_grip + (racketObjGrip[j]*racketMaterial[0].weight)
                                                            console.log('grip:',weight_grip)
                                                        }
                                                    }
                                            
                                                    for(var j in racketObjHead){
                                                        if(racketObjHead[j] !== 0){
                                                            const racketMaterial = await db('racketMaterial').where('type', '=', j);
                                                            weight_head = weight_head + (racketObjHead[j]*racketMaterial[0].weight)
                                                            console.log('head:',weight_head)
                                                        }
                                                    }

                                                    let randomtechnology =Math.floor(Math.random() * 6) + 1 ;
                                                    if(randomtechnology === 2){
                                                        console.log('prvy test', randomtechnology)
                                                        db('orders').where('id', '=', id).update('status', 'Raketa neprešla testom kvality-Použitý zlý materiál').then('db was updated')
                                                    }
                                                    else{
                                                        console.log('prvy test', randomtechnology)
                                                                let final_weight = weight_frame + weight_grip + weight_head;
                                                                let real_weight = 0;
                                                    
                                                                console.log('final:',final_weight)
                                                                let randomValue =Math.floor(Math.random() * 6) + 1 ;
                                                                //ZMENA VAHY
                                                                if(randomValue === 2){
                                                                    real_weight = 1.15*final_weight;
                                                                    console.log('Padla 4 -> zla vyroba')
                                                                }
                                                                else{
                                                                    real_weight = final_weight;
                                                                    console.log('nepadla 4 -> padla', randomValue)
                                                                }
                                                                console.log('random:', real_weight)
                                                                if(final_weight === real_weight){
                                                                    db('stopProduction').where('id', '=', 1)
                                                                    .then((data)=>{
                                                                        if(data[0].stop !== 1){
                                                                            db('orders').where('id', '=', id).update('status', 'Objednávka odoslaná').then('db was updated')
            
                                                                        }
                                                                    })
                                                                }
                                                                else{
                                                                    db('stopProduction').where('id', '=', 1)
                                                                    .then((data)=>{
                                                                        if(data[0].stop !== 1){
                                                                            db('orders').where('id', '=', id).update('status', 'Raketa neprešla testom kvality-Nesedí váha').then('db was updated')
                                                                        }
                                                                    })
                                                                }
                                                            }
                                         }
                                     }
                }
            }, count*10000);
        } 
    }
    
}


app.post('/startProduction', async (req, res)=>{
    const {order_id, stop} = req.body;
    console.log(order_id)

    const order = await db('orders').where('id', '=', order_id);
    console.log(order)
    let count = 0;

    if(order[0].name === 'Type-1'){
        count = 1;
    }
    else if(order[0].name === 'Type-2'){
        count = 1.5;
    } 
    else if(order[0].name === 'Type-3'){
        count = 2;
    }
    else if(order[0].name.includes('Vlastná raketa')){
        count = 3;
    }
    await state1(db, order_id, count)
    
})

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`app is running on port ${port}`);
});