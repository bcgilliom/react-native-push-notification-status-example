//
//  NotificationService.m
//  pushServiceExtension
//
//  Created by Brian Cooley-Gilliom on 12/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "NotificationService.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];
    
    NSUserDefaults *userDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.fsl.pnstatus"];
    NSString *endpoint = [userDefaults stringForKey:@"endpoint"];

    NSString *notificationId = [request.content.userInfo valueForKey:@"notificationId"];
     
    if (notificationId != nil) {
      NSString *urlStr = [NSString stringWithFormat:@"%@/%@?status=RECEIVED", endpoint, notificationId];
      NSURL *url = [NSURL URLWithString:urlStr];
      NSMutableURLRequest *req = [[NSMutableURLRequest alloc] init];
      [req setHTTPMethod:@"POST"];
      [req setURL:url];
      
      [[[NSURLSession sharedSession] dataTaskWithRequest:req completionHandler:
        ^(NSData * _Nullable data,  
          NSURLResponse * _Nullable response,
          NSError * _Nullable error) {
            NSString *responseStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            NSLog(@"Data received: %@", responseStr);
      }] resume];
    };
    
    self.contentHandler(self.bestAttemptContent);
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    self.contentHandler(self.bestAttemptContent);
}

@end
