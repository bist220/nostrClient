import * as React from 'react';
import { Text, View, FlatList, Pressable, Modal } from 'react-native';
import { NostrServerList } from '../NostrServerList';
import { styles, stylesModal } from '../AppNav';

export const SelectServer = ({ server, setServer }) => {
  const [serverList, setServerList] = React.useState<Array<string>>();

  React.useEffect(() => {
    setServerList(NostrServerList);
  }, []);

  const [modalVisible, setModalVisible] = React.useState(false);

  const setServerOnPress = (serverStr: string) => {
    setServer(serverStr);
    setModalVisible(!modalVisible);
  };

  const renderItem = ({ item }: { item: string; }) => {
    return (
      <Pressable
        onPress={(e) => setServerOnPress(item)}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
          },
          styles.wrapperCustom,
        ]}>
        <Text>{item}</Text>
      </Pressable>
    );
  };

  return (
    <View style={stylesModal.centeredView}>

      <Modal
        style={stylesModal.modalCenteredView}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          //Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={stylesModal.centeredView}>
          <View style={{ maxHeight: 500 }}>
            <View style={stylesModal.modalView}>
              <Text style={stylesModal.modalText}>Select Server</Text>
              <FlatList
                style={{ margin: 40, maxHeight: 300 }}
                data={serverList}
                renderItem={renderItem} />
              <Pressable
                style={[stylesModal.button, stylesModal.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={stylesModal.textStyle}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Pressable
        style={[stylesModal.button, stylesModal.buttonOpen, stylesModal.modalButton]}
        onPress={() => setModalVisible(true)}>
        <Text style={stylesModal.textStyle}>Select Server</Text>
      </Pressable>
    </View>
  );
};
