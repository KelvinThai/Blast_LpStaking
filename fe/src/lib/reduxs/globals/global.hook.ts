import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/lib/reduxs/store";
import {useCallback} from "react";
import {setCurrentCoinAction} from "@/lib/reduxs/globals/global.slices";

export const useGlobalState = () => {
    const globalState = useSelector((state: RootState) => state.global);
    const dispatch = useDispatch();

    const onSetCurrentCoin = useCallback((coin: "eth" | "usdb") => {
        dispatch(setCurrentCoinAction(coin));
    }, [dispatch])

    return {globalState, onSetCurrentCoin};
}