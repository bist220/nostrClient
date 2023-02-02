import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ClientWebSocket, { ClientMessage } from "./ClientWebSocket";

/*
type RootStackParamList = {
    Home: undefined;
    Profile: { userId: string };
    Feed: { sort: 'latest' | 'top' } | undefined;
};
  
type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;
*/
export type RootStackParamList = {
    Loading : undefined;
    SignUp : undefined;
    SignIn : undefined;
    Home: undefined;
    Details: { item: ClientMessage; metaMsgs: Map<string, ClientMessage>; };
    Message: undefined;
    //{clientSocket : ClientWebSocket};
};
export type LoadingScreenProps = NativeStackScreenProps<RootStackParamList, 'Loading'>;
export type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
export type SignInScreenProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
export type MessageScreenProps = NativeStackScreenProps<RootStackParamList, 'Message'>;
