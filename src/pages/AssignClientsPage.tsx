
  // Function to get the appropriate badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'secondary';
      case 'RE-ASSIGNED':
        return 'secondary';
      case 'STARTED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'RATED':
        return 'warning';
      case 'CLOSED':
        return 'default';
      default:
        return 'secondary';
    }
  };
