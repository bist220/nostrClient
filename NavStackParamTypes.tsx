import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientMessage } from "./ClientWebSocket";

export type RootStackParamList = {
    Loading : undefined;
    SignUp : undefined;
    SignIn : undefined;
    Home: undefined;
    Details: { item: ClientMessage, metaMsg: ClientMessage; };
    Message: undefined;
    UserDetail: { item: ClientMessage, metaMsg: ClientMessage; };
};

export type LoadingScreenProps = NativeStackScreenProps<RootStackParamList, 'Loading'>;
export type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
export type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
export type MessageScreenProps = NativeStackScreenProps<RootStackParamList, 'Message'>;
export type UserDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'UserDetail'>;


export type GenericScreenNavigationProp = NativeStackNavigationProp < RootStackParamList >;
export type DetailScreenNavigationProp = NativeStackNavigationProp< RootStackParamList, 'Details'>;
export type UserDetailScreenNavigationProp = NativeStackNavigationProp< RootStackParamList, 'UserDetail'>;

