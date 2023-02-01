import React from 'react';
import { View, Text, ScrollView } from "react-native";
import { ClientMessage } from "../ClientWebSocket";
import { DetailScreenProps } from '../NavStackParamTypes';
import { ViewMessage, styles } from "../HomeScreen";

export function DetailScreen({ navigation, route }: DetailScreenProps) {
    let item: ClientMessage = route.params.item;
    let metaMsgs: Map<string, ClientMessage> = route.params.metaMsgs;
    /*
        <Button
          title="Go to Details... again"
          onPress={() => navigation.navigate('Details', route.params)}
        />
    */
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Details Screen</Text>
            <ScrollView>
                <ViewMessage viewStyle={styles.itemContainer} item={item} metaMsgs={metaMsgs}></ViewMessage>
            </ScrollView>

        </View>
    );
}
