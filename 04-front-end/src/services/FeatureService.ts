import FeatureModel from '../../../03-back-end/src/components/feature/model';
import api from '../api/api';

export default class FeatureService {
    public static editFeature(featureId: number, newName: string): Promise<FeatureModel|null> {
        return new Promise<FeatureModel|null>(resolve => {
            api("put", "/feature/" + featureId, "administrator", {
                name: newName,
            }).then(res => {
                if (res?.status !== "ok") {
                    return resolve(null);
                }

                if (res.data?.errorCode !== undefined) {
                    return resolve(null);
                }

                resolve(res.data);
            })
        });
    }

    public static deleteFeature(featureId: number): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            api("delete", "/feature/" + featureId, "administrator").then(res => {
                if (res?.status !== "ok") {
                    return resolve(false);
                }

                if (res.data?.errorCode !== 0) {
                    return resolve(false);
                }

                resolve(true);
            })
        });
    }
}
