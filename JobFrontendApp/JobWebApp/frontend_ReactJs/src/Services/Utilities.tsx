const formatDate=(dateString:string)=> {
    const date = new Date(dateString);
    const options = { year: 'numeric' as const, month: 'short' as const };
    return date.toLocaleString('en-US', options);
  }
  function timeAgo(timestamp:string) {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInMs = now.getTime() - postDate.getTime();

  
    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
  
    if (seconds < 60) {
      return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (days < 30) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (months < 12) {
      return `${months} month${months === 1 ? '' : 's'} ago`;
    } else {
      return `${years} year${years === 1 ? '' : 's'} ago`;
    }
  }
  const getBase64 = (file:any) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};
const openPDF=(base64: string)=>{
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  
  const newWindow = window.open(blobUrl);
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    alert('Popup was blocked. Please allow popups for this website.');
  }
}
// The API stores interview times in UTC and returns them without a timezone ("2026-12-01T04:30:00").
// Read such values as UTC so each viewer sees their own local time (10:00 AM in India, not 4:30 AM).
const parseServerDate=(value:string|Date)=>{
  if (value instanceof Date) return value;
  return new Date(/([zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : value + 'Z');
}

/** "Mon, 1 Dec 2026" and "10:00 AM" for an interview slot. */
const formatInterviewSlot=(value:string|Date)=>{
  const date = parseServerDate(value);
  return {
    day: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase(),
  };
}

const formatInterviewTime=(dateString:string)=>{
  const date = parseServerDate(dateString);

const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',    
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true      
};

return date.toLocaleString('en-US', options);
}  

  export {formatDate, timeAgo, getBase64, openPDF, formatInterviewTime, formatInterviewSlot};