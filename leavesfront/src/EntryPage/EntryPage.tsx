import IntroduceApp from './IntroduceApp';
import IntroduceDivideConquer from './IntroduceDivideConquer';
import SignInScreen from './SignInScreen';

const EntryPage: React.FC = () => {
  return (
    <div>
      <IntroduceApp />
      <SignInScreen />
      <IntroduceDivideConquer videoSrc="../../public/introduceDivideConquer.mp4" />
    </div>
  );
};

export default EntryPage;
