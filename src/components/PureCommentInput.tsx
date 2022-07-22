import { Mention, MentionsInput } from 'react-mentions'; // https://www.npmjs.com/package/react-mentions

const defaultStyle = {
  // input: {
  //   padding: null,
  //   border: null,
  //   color: null,
  //   display: null,
  //   width: null,
  //   position: null,
  //   margin: null,
  //   top: null,
  //   left: null,
  //   boxSizing: null,
  //   borderColor: null,
  //   backgroundColor: null,
  //   fontFamily: null,
  //   fontSize: null,
  //   letterSpacing: null,
  // },

  control: {
    // backgroundColor: '#fff',
    // fontSize: 14,
    // fontWeight: 'normal',
  },

  '&multiLine': {
    control: {
      fontFamily: 'monospace',
      minHeight: 63,
    },
    highlighter: {
      padding: 9,
      // border: '1px solid transparent',
    },
    input: {
      padding: 9,
      // border: '1px solid silver',
    },
  },

  '&singleLine': {
    display: 'inline-block',
    width: 180,

    highlighter: {
      padding: 1,
      // border: '2px inset transparent',
    },
    input: {
      padding: 1,
      // border: '2px inset',
    },
  },

  suggestions: {
    marginTop: '15px',
    marginLeft: '10px',
    borderRadius: '4px',
    list: {
      backgroundColor: '#fff',
      border: '1px solid #d2d6de',
      borderRadius: '4px',
    },

    item: {
      borderRadius: '4px',
      padding: '5px 15px',
      // borderBottom: "1px solid #d2d6de",
      '&focused': {
        backgroundColor: '#fafbff',
        color: '#474d66',
      },
    },
  },
};

type IPureCommentInput = {
  text: string;
  placeholder: string;
  handleInputChange: (newValue: string, newPlainTextValue: string, _mentions: string[]) => void;
  suggestions: { id: string; nickname: string }[];
};

const PureCommentInput = (props: IPureCommentInput) => {
  const { text, placeholder, handleInputChange, suggestions } = props;
  return (
    <>
      <MentionsInput
        style={defaultStyle}
        className="mentions"
        classNames={{
          mentions__input: 'bg-white rounded text-gray-800 w-full outline-none focus:ring-0 focus:outline-none border focus:border-gray-200 border-gray-200 resize-none sm:text-sm',
        }}
        placeholder={placeholder}
        value={text}
        // displayTransform={(id: string, display: string) => {
        //   return `@${display}`;
        // }}
        onChange={(event, newValue, newPlainTextValue, mentions) => {
          handleInputChange(
            newValue,
            newPlainTextValue,
            mentions.map((m) => m.id),
          );
          return event;
        }}
      >
        <Mention
          trigger="@"
          data={suggestions.map((suggestion) => ({
            id: suggestion.id,
            display: suggestion.nickname,
          }))}
          markup="@[__display__](__id__)"
          appendSpaceOnAdd={true}
        />
      </MentionsInput>
    </>
  );
};

export default PureCommentInput;
