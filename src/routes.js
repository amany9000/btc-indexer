import { Router } from 'express';
import { findByORD } from './models';

const router = Router();

router.get('/:opReturnData', async (req, res) => {
  const payload = await findByORD(
    req.params.opReturnData
  );
  if (payload.error){
    return res.send(payload, 404)
  }
  else{
    Promise.all(payload).then((values) => {
      return res.send({"opReturnData": values[0].dataValues.ORD,
                      "instances" : values.map((element) => ({
                        "transactionHash": element.dataValues.hash,
                        "blockHash": element.dataValues.blockHash
                      }))             
                  });
    })
  }
});

export default router;