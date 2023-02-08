import React from 'react';
import { View, ScrollView } from "react-native";
import { ClientMessage } from "../ClientWebSocket";
import { DetailScreenProps } from '../NavStackParamTypes';
import { ViewMessage, styles } from "../HomeScreen";

export function DetailScreen({ navigation, route }: DetailScreenProps) {
    let item: ClientMessage = route.params.item;
    let metaMsg: ClientMessage = route.params.metaMsg;
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ScrollView>
                <ViewMessage viewStyle={styles.itemContainer} item={item} metaMsg={metaMsg} navigation={navigation}></ViewMessage>
            </ScrollView>
        </View>
    );
}
