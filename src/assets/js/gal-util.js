import store from '../../store/index';
import { OPEN_VOU } from '../../store/gal';
import { SESSION_STORAGE } from '../../store/service/storage-service';
import { STORAGE_KEY } from './constant';

export default {
  /**
   * 创建一张新凭证
   * @param agyAcb 单位帐套信息
   */
  newVou(agyAcb) {
    SESSION_STORAGE.set(STORAGE_KEY.OPEN_VOU, {
      type: 'newvou',
      agyCode: agyAcb.agyCode,
      agyName: agyAcb.agyName,
      acbCode: agyAcb.acbCode,
      acbName: agyAcb.acbName,
      acsCode: agyAcb.acsCode
    });
    store.commit(OPEN_VOU);
  },

  /**
   * 打开一张凭证
   * @param agyAcb 单位帐套信息
   * @param pvouId 凭证id
   * @param readOnly 只读状态
   */
  openVouById(agyAcb, pvouId, readOnly) {
    SESSION_STORAGE.set(STORAGE_KEY.OPEN_VOU, {
      type: 'openVouById',
      vouId: pvouId,
      agyCode: agyAcb.agyCode,
      agyName: agyAcb.agyName,
      acbCode: agyAcb.acbCode,
      acbName: agyAcb.acbName,
      acsCode: agyAcb.acsCode,
      isReadOnly: readOnly
    });
    store.commit(OPEN_VOU);
  },

  /**
   * 打开一张凭证
   * @param agyAcb 单位帐套信息
   * @param pvouId 凭证id
   * @param readOnly 只读状态
   * @param notNeedNewVouNo 是否不产生一个新的凭证No
   * @param pmatter
   */
  openUnSavedVou(agyAcb, pvoucher, readOnly, notNeedNewVouNo, pmatter) {
    SESSION_STORAGE.set(STORAGE_KEY.OPEN_VOU, {
      type: 'openUnSavedVou',
      voucher: pvoucher,
      agyCode: agyAcb.agyCode,
      agyName: agyAcb.agyName,
      acbCode: agyAcb.acbCode,
      acbName: agyAcb.acbName,
      acsCode: agyAcb.acsCode,
      isReadOnly: readOnly,
      needNewNo: !notNeedNewVouNo,
      matter: pmatter
    });
    store.commit(OPEN_VOU);
  }
};
