import { Mention, MentionsInput } from 'react-mentions'; // https://www.npmjs.com/package/react-mentions

const defaultStyle = {
  // text input background
  control: {
    width: '100%',
    height: '100px',
  },
  // text input background
  '&multiLine': {
    control: {
      fontSize: '12px',
      fontFamily: '"SF UI Text", -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      minHeight: 64,
    },
    highlighter: {
      border: '1px solid transparent',
    },
    input: {
      padding: 6,
      border: '0',
      color: '#474d66',
    },
  },

  '&singleLine': {
    display: 'inline-block',
    width: 180,
    highlighter: {
      padding: 1,
      border: '2px inset transparent',
    },
    input: {
      padding: 1,
      border: '2px inset',
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
        placeholder={placeholder}
        value={text}
        // displayTransform={(id: string, display: string) => {
        //   return `@${display}`;
        // }}
        onChange={(event, newValue, newPlainTextValue, mentions) => {
          console.log(event);
          handleInputChange(
            newValue,
            newPlainTextValue,
            mentions.map((m) => m.id),
          );
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
